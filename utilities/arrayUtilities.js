// eslint-disable-next-line no-extend-native
Object.defineProperty(Array.prototype, 'paginate', {
    value(pageSize, pageNumber) {
        const result = [];
        let start;
        let end;
        start = 0;
        for (let i = 0; i < pageNumber; i += 1) {
            end = start + pageSize;
            const subArr = this.slice(start, end);
            if (subArr.length > 0) {
                result.push(subArr);
            } else {
                break;
            }
            start = end;
        }
        return result;
    },
});
