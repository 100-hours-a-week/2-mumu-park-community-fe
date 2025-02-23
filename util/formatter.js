function formatNumber(num) {
  if (num >= 100000) {
    return Math.floor(num / 1000) + "k";
  } else if (num >= 10000) {
    return Math.floor(num / 1000) + "k";
  } else if (num >= 1000) {
    return Math.floor(num / 1000) + "k";
  }
  return num.toString();
}

function formatDate(date) {
  const d = new Date(date);
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0") +
    " " +
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0") +
    ":" +
    String(d.getSeconds()).padStart(2, "0")
  );
}
