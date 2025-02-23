function limitTitleLength(event) {
  const input = event.target;
  if (input.value.length > 26) {
    input.value = input.value.substring(0, 26);
  }
}
