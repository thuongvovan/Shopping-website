function nameNormalizer(name) {
    return name
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

module.exports = { nameNormalizer };
