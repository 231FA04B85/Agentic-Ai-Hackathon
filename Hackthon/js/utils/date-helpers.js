window.DateHelpers = {
    format(date = new Date()) {
        return new Date(date).toLocaleDateString();
    },
    relative(date) {
        const days = Math.round((Date.now() - new Date(date).getTime()) / 86400000);
        return days <= 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'} ago`;
    }
};
