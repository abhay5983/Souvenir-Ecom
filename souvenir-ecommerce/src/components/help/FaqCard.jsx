function FaqCard({ faq }) {
  if (!faq) {
    return null;
  }

  return (
    <details className="card faq-card">
      <summary>{faq.question}</summary>

      <p>{faq.answer}</p>
    </details>
  );
}

export default FaqCard;