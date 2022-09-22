import GObject from '@gi/gobject2';

type RegisterParams = Parameters<typeof GObject.registerClass>;

export function registerClass(options: RegisterParams[0] = {}) {
	return function decorate(target: RegisterParams[1]): ReturnType<typeof GObject.registerClass> {
		return GObject.registerClass(options, target);
	};
}
