from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Any, List
from ..models.plants import UserPlant, CareSchedule, CareHistory, PlantCatalog


class PlantCareService:
    """Service for managing plant care schedules and logic"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_initial_schedule(self, user_plant_id: int) -> List[CareSchedule]:
        """Create initial care schedule for a newly added plant"""
        user_plant = self.db.query(UserPlant).filter(UserPlant.id == user_plant_id).first()
        if not user_plant:
            raise ValueError("Plant not found")
        
        care_requirements = user_plant.plant_catalog.care_requirements
        schedules = []
        
        # Create schedules based on plant requirements
        now = datetime.utcnow()
        
        # Watering schedule
        if "watering_frequency_days" in care_requirements:
            water_schedule = CareSchedule(
                user_plant_id=user_plant_id,
                task_type="watering",
                frequency_days=care_requirements["watering_frequency_days"],
                next_due=now + timedelta(days=care_requirements["watering_frequency_days"]),
                conditions=self._get_watering_conditions(care_requirements)
            )
            schedules.append(water_schedule)
        
        # Fertilizing schedule (if specified)
        if "fertilizing_frequency_days" in care_requirements:
            fertilizer_schedule = CareSchedule(
                user_plant_id=user_plant_id,
                task_type="fertilizing",
                frequency_days=care_requirements["fertilizing_frequency_days"],
                next_due=now + timedelta(days=care_requirements["fertilizing_frequency_days"]),
                conditions={"season_adjust": True}
            )
            schedules.append(fertilizer_schedule)
        
        # Misting schedule (for humidity-loving plants)
        if care_requirements.get("humidity_level") == "high":
            misting_schedule = CareSchedule(
                user_plant_id=user_plant_id,
                task_type="misting",
                frequency_days=2,  # Every 2 days for high humidity plants
                next_due=now + timedelta(days=2),
                conditions={"humidity_dependent": True}
            )
            schedules.append(misting_schedule)
        
        # Add all schedules to database
        for schedule in schedules:
            self.db.add(schedule)
        
        self.db.commit()
        return schedules
    
    def update_schedule_after_care(self, user_plant_id: int, task_type: str) -> CareSchedule:
        """Update care schedule after task completion"""
        # Get the current schedule for this task
        schedule = self.db.query(CareSchedule).filter(
            CareSchedule.user_plant_id == user_plant_id,
            CareSchedule.task_type == task_type,
            CareSchedule.is_active == True
        ).first()
        
        if not schedule:
            return None
        
        # Calculate next due date
        next_due = datetime.utcnow() + timedelta(days=schedule.frequency_days)
        
        # Adjust for environmental factors
        next_due = self._adjust_for_conditions(schedule, next_due)
        
        # Adjust based on care history (learning from user patterns)
        next_due = self._adjust_for_history(user_plant_id, task_type, next_due)
        
        schedule.next_due = next_due
        schedule.updated_at = datetime.utcnow()
        
        self.db.commit()
        return schedule
    
    def get_overdue_tasks(self) -> List[CareSchedule]:
        """Get all overdue care tasks across all users"""
        now = datetime.utcnow()
        overdue = self.db.query(CareSchedule).filter(
            CareSchedule.next_due <= now,
            CareSchedule.is_active == True
        ).all()
        
        return overdue
    
    def _get_watering_conditions(self, care_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Generate watering conditions based on plant requirements"""
        conditions = {}
        
        # Light level affects watering frequency
        if "light_level" in care_requirements:
            light_level = care_requirements["light_level"]
            if light_level == "bright":
                conditions["light_multiplier"] = 0.9  # Water more frequently in bright light
            elif light_level == "low":
                conditions["light_multiplier"] = 1.2  # Water less frequently in low light
        
        # Pot size affects watering
        if "pot_size" in care_requirements:
            pot_size = care_requirements["pot_size"]
            if pot_size == "small":
                conditions["pot_multiplier"] = 0.8  # Small pots dry out faster
            elif pot_size == "large":
                conditions["pot_multiplier"] = 1.3  # Large pots hold water longer
        
        # Season adjustments
        conditions["season_adjust"] = True
        
        return conditions
    
    def _adjust_for_conditions(self, schedule: CareSchedule, base_next_due: datetime) -> datetime:
        """Adjust scheduling based on environmental conditions"""
        if not schedule.conditions:
            return base_next_due
        
        adjustment_factor = 1.0
        conditions = schedule.conditions
        
        # Apply light multiplier
        if "light_multiplier" in conditions:
            adjustment_factor *= conditions["light_multiplier"]
        
        # Apply pot size multiplier
        if "pot_multiplier" in conditions:
            adjustment_factor *= conditions["pot_multiplier"]
        
        # Seasonal adjustments (simplified - in real app would use actual season/weather data)
        if conditions.get("season_adjust"):
            import datetime as dt
            month = dt.datetime.now().month
            if month in [12, 1, 2]:  # Winter
                adjustment_factor *= 1.3  # Water less in winter
            elif month in [6, 7, 8]:  # Summer
                adjustment_factor *= 0.8  # Water more in summer
        
        # Calculate adjusted frequency
        adjusted_days = schedule.frequency_days * adjustment_factor
        return datetime.utcnow() + timedelta(days=adjusted_days)
    
    def _adjust_for_history(self, user_plant_id: int, task_type: str, base_next_due: datetime) -> datetime:
        """Adjust based on user's care patterns (machine learning opportunity)"""
        # Get recent care history
        recent_care = self.db.query(CareHistory).filter(
            CareHistory.user_plant_id == user_plant_id,
            CareHistory.task_type == task_type
        ).order_by(CareHistory.completed_at.desc()).limit(5).all()
        
        if len(recent_care) < 2:
            return base_next_due  # Not enough data
        
        # Calculate average time between care events
        intervals = []
        for i in range(len(recent_care) - 1):
            interval = (recent_care[i].completed_at - recent_care[i + 1].completed_at).days
            intervals.append(interval)
        
        if intervals:
            avg_interval = sum(intervals) / len(intervals)
            
            # If user tends to care more frequently, adjust schedule
            if avg_interval < base_next_due.timestamp():
                # User cares more frequently than recommended, slightly reduce frequency
                adjustment = 0.9
            else:
                # User cares less frequently, keep standard schedule
                adjustment = 1.0
            
            adjusted_days = (base_next_due - datetime.utcnow()).days * adjustment
            return datetime.utcnow() + timedelta(days=max(1, adjusted_days))
        
        return base_next_due
    
    def get_plant_health_score(self, user_plant_id: int) -> float:
        """Calculate a health score based on care consistency (0-100)"""
        # Get care schedules and history
        schedules = self.db.query(CareSchedule).filter(
            CareSchedule.user_plant_id == user_plant_id,
            CareSchedule.is_active == True
        ).all()
        
        if not schedules:
            return 50.0  # Neutral score if no schedules
        
        total_score = 0
        score_count = 0
        
        for schedule in schedules:
            # Get recent care history for this task type
            recent_care = self.db.query(CareHistory).filter(
                CareHistory.user_plant_id == user_plant_id,
                CareHistory.task_type == schedule.task_type,
                CareHistory.completed_at >= datetime.utcnow() - timedelta(days=30)
            ).count()
            
            # Calculate expected care events in last 30 days
            expected_care = 30 / schedule.frequency_days
            
            # Score based on actual vs expected care
            if expected_care > 0:
                care_ratio = min(recent_care / expected_care, 1.0)
                task_score = care_ratio * 100
                total_score += task_score
                score_count += 1
        
        return total_score / score_count if score_count > 0 else 50.0
