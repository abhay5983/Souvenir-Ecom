function BookCover({ series }) {
  if (series.coverImageUrl) {
    return <img className="book-cover" src={series.coverImageUrl} alt={`${series.title} cover`} loading="lazy" />;
  }
  return (
    <div
      className={`book-cover ${series.coverTone}`}
      aria-hidden="true"
    >
      <span>{series.title}</span>
    </div>
  );
}

export default BookCover;
