"""End-to-end integration test verifying Groq + Hindsight persistent memory.

Demonstrates:
  1. Cold analysis (no past memory for new repo)
  2. Retention into Hindsight
  3. Developer feedback submission
  4. Warm analysis (recalls past memory and adapts recommendations)
"""

import asyncio
import os
import sys

# Ensure backend root is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.agents.code_review import analyze_repository
from app.api.analysis import FeedbackRequest, submit_feedback


async def test_groq_and_hindsight_learning_loop():
    repo_id = "test-e2e-repo"
    code_sample = (
        "def authenticate_user(username, password):\n"
        "    import hashlib\n"
        "    # MD5 hashing without salt - vulnerable\n"
        "    hashed = hashlib.md5(password.encode()).hexdigest()\n"
        "    query = f\"SELECT * FROM users WHERE username = '{username}' AND password = '{hashed}'\"\n"
        "    return execute_query(query)\n"
    )

    print("Step 1: First analysis (Cold start - no past memory)...")
    result_cold = await analyze_repository(repo_id=repo_id, code_context=code_sample)
    print("Cold analysis summary:", result_cold.get("summary"))
    print("Cold findings count:", len(result_cold.get("findings", [])))
    print("Cold memories_used:", result_cold.get("memories_used"))

    print("\nStep 2: Submitting developer feedback to Hindsight...")
    finding_id = result_cold["findings"][0].get("id", "finding-1") if result_cold.get("findings") else "finding-1"
    fb = FeedbackRequest(
        finding_id=finding_id,
        action="accepted",
        comment="Confirmed MD5 and raw SQL formatting are strictly prohibited. Team rule: use argon2 and parameterized queries.",
    )
    fb_res = await submit_feedback(repo_id=repo_id, body=fb)
    print("Feedback retained:", fb_res)

    print("\nWaiting 2 seconds for Hindsight indexing...")
    await asyncio.sleep(2)

    print("\nStep 3: Second analysis (Warm memory - should recall past findings & feedback)...")
    result_warm = await analyze_repository(repo_id=repo_id, code_context=code_sample)
    print("Warm analysis summary:", result_warm.get("summary"))
    print("Warm memories_used:", result_warm.get("memories_used"))
    print("Warm memory_influenced:", result_warm.get("memory_influenced"))
    print("Warm patterns_detected:", result_warm.get("patterns_detected"))

    if result_warm.get("memories_used"):
        print("\n[VERIFIED] End-to-end Groq + Hindsight memory loop successfully executed!")
    else:
        print("\n[FAILED] Memories were not used in round 2.")


if __name__ == "__main__":
    asyncio.run(test_groq_and_hindsight_learning_loop())
