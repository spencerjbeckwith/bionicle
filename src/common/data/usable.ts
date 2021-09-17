import Battler from '../battle/battler';

type UseFunction = (bearer: Battler, target: Battler | null, instantaneous?: boolean) => Promise<void>

/** Represents anything that can be used that has an affect in battle, such as special moves, masks, or items. */
class Usable {
    constructor(
        public readonly targetType: 'single' | 'multiple' | null,
        public readonly defaultTarget: 'friendly' | 'enemy',
        public readonly use: UseFunction,
    ) {}
}

/** Represents anything that can be equipped to a Battler with the init/deinit system. */
interface Equippable {
    init: (bearer: Battler) => void;
    deinit: (bearer: Battler) => void;
}

export {
    UseFunction,
    Usable,
    Equippable,
}