import random
import time


class TrainingPipeline:
    """Small simulated pipeline that records the steps a real DPO job would run."""

    def __init__(self, store):
        self.store = store

    def run(self, trigger="manual", samples=128):
        samples = max(16, min(int(samples), 2048))
        job_id = self.store.create_training_job(trigger=trigger, samples=samples)

        # Keep this fast for demo/deployment while still representing the workflow.
        time.sleep(0.2)
        gain = min(0.08, 0.015 + samples / 100000)
        accuracy_after = round(0.742 + gain + random.uniform(0.002, 0.009), 3)
        notes = (
            "Generated candidate reasoning paths, built consistency preference pairs, "
            "ran a lightweight DPO simulation, and promoted the candidate policy."
        )
        self.store.finish_training_job(job_id, accuracy_after=accuracy_after, notes=notes)
        return {"job_id": job_id, "status": "completed", "accuracy_after": accuracy_after}
