import GObject from '@gi/gobject2';
export function registerClass(options = {}) {
    return function decorate(target) {
        return GObject.registerClass(options, target);
    };
}
