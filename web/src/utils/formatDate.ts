export const formatDate = (date: Date) => {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return `Today ${messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } else {
    return (
      messageDate.toLocaleDateString() +
      ' ' +
      messageDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }
};
