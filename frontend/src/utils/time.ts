import TimeAgo from 'javascript-time-ago';
import timeAgoEn from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(timeAgoEn);

function formatTimeAgo(date?: Date) {
  return (new TimeAgo('en-US')).format(date ?? new Date(Date.now()));
}

export {
  formatTimeAgo
};
