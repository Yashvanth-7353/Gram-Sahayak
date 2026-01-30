import httpx
import os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

async def ask_openrouter(context_text: str, user_query: str):
    """
    Sends community discussions + User Query to OpenRouter.
    Model: xiaomi/mimo-v2-flash:free
    """
    if not OPENROUTER_API_KEY:
        return "Error: OPENROUTER_API_KEY is missing in .env"

    prompt = f"""
    You are a smart assistant for a government official monitoring a village.
    
    Here is a log of recent discussions and complaints from the villagers:
    \"\"\"
    {context_text}
    \"\"\"
    
    Based ONLY on the text above, answer the official's question:
    "{user_query}"
    
    If the answer is not in the discussions, state that clearly.
    """

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "xiaomi/mimo-v2-flash:free",
                    "messages": [{"role": "user", "content": prompt}]
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return data['choices'][0]['message']['content']
            else:
                return f"Error from OpenRouter: {response.status_code} - {response.text}"
                
        except Exception as e:
            return f"LLM Connection Failed: {str(e)}"

# Keep the old analysis function if you need it, or it can be removed.
# I will leave a simplified version just in case other parts call it.
async def analyze_complaints(complaints_text: str):
    return {} 
