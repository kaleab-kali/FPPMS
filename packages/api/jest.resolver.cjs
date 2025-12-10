/**
 * Custom Jest resolver to handle ESM-only packages like uuid v13
 * @see https://github.com/nestjs/nest/issues/9930
 * @type {import('jest-resolve').Resolver}
 */
module.exports = (path, options) => {
	return options.defaultResolver(path, {
		...options,
		packageFilter: (pkg) => {
			if (pkg.name === "uuid") {
				delete pkg.exports;
				delete pkg.module;
			}
			return pkg;
		},
	});
};
