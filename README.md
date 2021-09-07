
- NPM script `build` will watch the source directory and compile/rollup your Typescript.

- NPM script `host` will host a local webserver, serving your game files, and will open your browser to the page.

- NPM script `watch` will watch the images asset folder and will recompile your atlas (via the `atlas` script) automatically when a change is detected. If you've also run `build` this change will then trigger that as well.

Running all three of these together ensures a smooth development process. When saving an image or Typescript, the only thing you must do to run the game is refresh your browser page.

==========

BIONICLE MMORPG

Okay, so what exactly am I trying to make?
- A Bionicle MMO in which you explore the island of Mata Nui, leveling up your Toa as you scour the island for your masks of power.
 I want to keep the battle system simple, but engaging. Outside of the game's characters, setting and content - enemies will vary and the player will have a variety of options available for each Toa they want to build.

Toa Equipment:
- Right Hand - main weapon
    - Weapons: Some take more than one hand, such as a Greatsword. All weapons enable a different sort of power. Ranged weapons require appropriate ammunition in your inventory.
        Weapons:
            - Sword - one handed
            - Greatsword - two handed
            - Axe - one handed
            - Claw - one handed
            - Hook - one handed
            - Katana - one handed
            - Shield - left hand only, increases defense
            - Disk Launcher - two handed but much more effective than throwing a disk. Requires either bamboo or Kanoka disks to use
            - Zamor Sphere Launcher. one handed, and generally weaker than a disk launcher. Requires zamor spheres to use
                Each weapon has different variants as well, which may boost different stats or modify elemental resistances.
                Each weapon, when used, has a specific attack move. Dual-wielding allows for two attacks that are weaker. Wielding one single-hand weapon increases its output as well.
- Left Hand - support equipment or another weapon
- Armor
    - Can block incoming damage, in the form of physical or elemental protection. May also provide other boons or bonuses
- Accessory
    - Can provide all sorts of unique effects, statuses, or resistances
- Masks
    - The key point of the game, each providing a passive effect and an active effect when used in battle.
    Hau - the mask of shielding
        Passive: increases defense
        Active: Greatly reduce incoming damage for several turns
    Kakama - the mask of speed
        Passive: increases speed, enables quick-travel at certain locations
        Active: Greatly increase speed for several turns
    Pakari - the mask of strength
        Passive: increase damage output
        Active: deal massive damage
    Akaku - the mask of vision
        Passive: increase accuracy and critical hit chance
        Active: view enemy statistics and elements
    Miru - the mask of flight
        Passive: increase evasion
        Active: Evade incoming attacks for several turns
    Kaukau - the mask of water breathing
        Passive: decrease the impact of status effects
        Active: Greatly reduce incoming elemental damage for several turns

    Noble masks - optional side-quests
    Huna - invisibility
        Passsive: makes you less likely to be targeted
        Active: Evade incoming attacks for several turns, gain a free critical hit if you attack, ending the effect early
    Komau - mind control
        Passive: 
        Active: can enrage low-level creatures

Eh... do we need a battle system that impelements your position in a battle? For example, whether or not you're detected by an enemy or whether or not they see you as hostile

I dunno. How does multiplayer play in?

You have to decide: make it an MMO, or a local-play sort of thing? An MMO is a bit much to work on
Does this even need to be multiplayer? I mean... single-player would be easier. But managing six toa at once would be a total headache. That's too much of a toolset. It'd be easier if each player only manages one Toa and fights alongside several others... so how do we promote teamwork among team members?
- Provide several possible battle options you can sacrifice your turn in order to support your teammates:
    - Protect - take all single-target attacks for an ally this turn
    - ?...

The idea behind all this is that the harder the battle, the more players have to depend on one another. It's unlikely they'll have every mask, element or item at their disposal - and as characters have different inventories, it'll be a matter of preserving your own personal goods for the sake of the team. UNITY
Each Toa can only have one element, and that element has a limited moveset, too. So each element has different moves that are meant to complement one another
Ultimate form of UNITY is to fuse with your teammates once you reach a high enough level - to become a TOA KAITA and control it together.
DUTY - the quests you're fulfilling
DESTINY - completing the game. yeah, that's cool.

Design goal: make each character player-independent, but encourage players to depend on each other and cooperate as much as they possibly can.
Keep enemies varied in their attacking styles and what is necessary to defeat them - and pull out some twists on them, too. But keep them defeatable.

FIRE: Specializes in destroying foes with a mix of power and attrition
    - Scorch: Apply a burn condition
    - Flamethrower: Attack a foe with a chance to burn.
    - Invigorate: Increase an ally's attack and elemental attack
STONE: Specializes in hard-hitting attacks that use physical defense.
    - Boulder: Attack a foe with a chance to confuse.
    - Guard: Increase an ally's defense and elemental defense
EARTH: Specializes in area-of-effect attacks to deal widespread damage
    - Earthquake: Attack all foes.
    - Soothe: Minor healing on an ally
ICE: Specializes in support and afflicting status ailments
    - Freeze: Apply a freeze condition
    - Confuse: Apply a confuse condition
    - Impale: Attack a foe with ice.
AIR: Specializes in speedy attacks and boosting the party
    - Gust: Attack a foe with air.
    - Float: Increase an ally's evasion
WATER: Specializes in healing and powering-up the party
    - Heal: Minor healing on an ally
Etc. etc... more moves. 
Point is, every element has a certain moveset that is learned on level up.
Enemies can have more than one element, and their moveset is independent of what their element is - they also have access to more elements and moves than the Toa do.

to do next:
- Types to implement:
    - StatusEffect
    - AppliedStatusEffect
    - Animation w/ their framesets
    - BattleControllerEvent
        - "start" "beginTurn" "endTurn" "end"
    - BattlerEvent
        - "start" "status" "attack" "damaged" "mask" "element" "protect" "item" "beginTurn" "endTurn" "die" "end" ...?

- Plan out battle flow - this is a necessary step. build a basic skeleton for BattleController
    - Ex. who attacks when?
    What data must be provided on different events? all battle data? You can pass the BattleController as an argument to any event handler, then...
    Where are there event emitters?
    Battle
        onStart
        onTurnBegin
        onTurnEnd
        onEnd
        -- and more
    Battler
        onStart
        onStatus
        onAttack
        onDamage
        onTurn
        onDie
        -- and more
- Set up battle flow function events
    Ok so every BattleController and Battler instance is an EventTarget. Meaning, at some point after each Battle begins - likely as part of the battle's initailization: each battler's equipment must call their own init functions to add appropriate event listeners. Every equipment must also have a "de-init" for when an item is unequipped

init and deinit are provided full access to the BattleController and every Battler present - so they can add events to virtually anything, anywhere.
Weapons: init and deinit
Equipment: init and deinit
Accessories: init and deinit
Inventory Items: use

    - Method to script events to be added when a battler equips something
        - Different events to add to: battle start, battle end, turn start, turn end, on damage, on deal damage, on use item, on use magic, on die, on heal... etc.
        - Use EventEmitter and add/remove listeners accordingly.
        - How can you include these sorts of things in templates?
            - Enemies with special effects should have those effects as equipment or accessories (just that can't be obtained by a player)
            Hm.... this'll be interesting. The same system should apply to elemental attacks, weapon attacks, and other moves, yeah?
- Design battle HUD?