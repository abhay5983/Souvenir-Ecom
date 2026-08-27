function FlashMessage({ flash }) {
  if (!flash) {
    return null;
  }

  return (
    <div
      className={`notice ${flash.tone} flash`}
      role={
        flash.tone === "danger"
          ? "alert"
          : "status"
      }
      tabIndex="-1"
    >
      {flash.message}
    </div>
  );
}

export default FlashMessage;