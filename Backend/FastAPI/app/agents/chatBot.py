from openai import OpenAI

client = OpenAI()


def get_ai_reply(content: str, ticker: str, previous_response_id: str | None = None) -> tuple[str, str]:
    kwargs = dict(
        model="gpt-4o",
        instructions=(
            f"You are a financial advisor specializing in {ticker} stock. "
            f"The user is asking about {ticker} — keep all answers relevant to this stock. "
            "Only respond to questions about finance, stocks, and investing. "
            "Politely decline any off-topic questions."
        ),
        input=[{"role": "user", "content": content}],
        store=True,
    )
    if previous_response_id:
        kwargs["previous_response_id"] = previous_response_id

    response = client.responses.create(**kwargs)
    return response.output_text, response.id
