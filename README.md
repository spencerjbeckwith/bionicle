# BIONICLE

## Development Environment

- You must run `npm install` before using this package.
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

# Technical Info

## Battlers

Every fighter in a conflict is represented by a Battler instance. These are managed by a BattleController instance.

Each Battler follows a BattlerTemplate - a predefined "skeleton" of sorts, determining things like base stats, sprite information, elements, palettes, masks, etc. These work very well for enemies, because they should be generated at the start of a battle, but a different approach is taken for players: Player Battler instances must be referenced outside of a BattleController, because their templates must not be referenced anywhere but as part of the Battler itself. This is because their templates must change and mutate, such as when a player levels up - while all enemy templates must remain static and may not change.

Since player Battlers persist, you must be diligent to cure them of statuses, fix their stats when needed, and run the appropriate init/deinit methods when needed - because these instances are not forgotten.

## init, deinit, and use methods

Both Battlers and BattleControllers are event emitters. Different moves, equipment, masks, and status effects all do different and complex things - so each is provided with an init and a deinit function when they're defined (at game start). These functions should add event handlers for all the events they want to change to either Battler(s) or the BattleController.

For example, a "poison" status effect would have an init function that would add a "turnBegin" event to the affected Battler (must provided when init is called for a status) and in that event, an animation or sound might play along with the HP being subtracted.

Once that status is no longer active - like if the battle has ended, the status has expired or was cured, the battler has died, etc. then the deinit is called, which in this case, must remove the poison handler from the "turnBegin" event on that battler.

This sytem allows for flexible, complex, and unique effects for every mask, status, or piece of equipment. However, it is critical that these methods are called when necessary or you may end up with leftover events that don't make sense and can't be removed! Imagine you think you're cured of poison - but just turns out you've got poison forever because deinit wasn't called right.

This system of init/deinit is also reflected in the file structure: the "battle" folder has the actual code for things like Battlers and the BattleController, which call the init/deinit methods and dispatch events. The top-level files in the "data" folder export lists of things such as masks, statuses, etc. which pull in those init and deinit methods from the deeper level folders - so that each unique effect can have its own file and can be worked on without any one file becoming too chonky or unwieldly.

Some things have a "use" method, in addition to or in place of init/deinit. These indicate items or masks that can be used in a battle. Use is pretty simple - it is called when a Battler uses it and must be provided a user and target(s). For example, when you have a mask it provides a passive or conditional effect - applied via init/deinit - and when it is activated in battle, the use method is called.

## Actions

Everything done by a Battler is represented by an Action instance. Actions have multiple types - including "attack", "special", etc. Actions must be executed when a Battler takes their turn. Action execution returns a promise, which resolves once the action is done and after it does things such as run an animation, play a sound, etc. Action instances can represent everything that can possibly be done, by anyone, at any time.

By using promises, we can simplify the overall structuring of the BattleController and Battler classes. **Actions are not the same thing as Moves. Don't mix them up.**

## Timelines

Timelines are a frame-by-frame animation that can be played at any time. When a timeline is played, its main method must be called every frame after that until the timeline completes. Any number of timelines can be playing at once, as long as their main methods are called - though typically you wouldn't want more than one at once. The same timeline cannot play more than once at a time.

Timelines are intended for battle animations or different screen effects.

## Special Moves

(not implemented yet. Do next)

Battlers have access to different "movesets" defined by their template. Player Battlers learn moves as they level up, according to their element. Non-player Battlers can have access to any move, regardless of their element, as set in their template. Special Moves are not the same as Actions - Actions are just able to represent a Battler using a special move, in addition to all the other possibilities available to a Battler.

Special Moves have a "use" method, like items or masks, which returns a promise that resolves once all the moves effects are over and complete.

# Netplay

Write specifics about how the network is going to work. Some preliminary thoughts:
- Battlers must have AI that evaluates situations equally, regardless of if its a friendly or a foe. In fact, it may as well not know. However, in an online session, AI must be evaluated on the server-side so that every client has the same results...
- Actions will be the primary means of communicating during a battle. Each turn - every battlers action is sent to every client, then they watch the animations and see effects, and then the next turn begins. **No data will be stored on connected clients besides static game data, such as moves, timelines, or items. Nor will any calculations of any kind take place on a connected client.**
    - Actions must be "verified" on the server-side before they can be accepted by the server, to make sure players don't take actions that their Battler could not do. For example, using a move they don't know or an item they don't have.
        - Will some actions need to have a "result" sent along with them? Or maybe a "FulfilledAction" class? This is because if calculations could occur on client machines, damage inflicted *could* be different if there's any element of randomness. Instead, the server must run all calculations - meaning the clients must be told the results of each action.
            - So all the clients do, really, is play animations and sound and accept player input. They send Actions to the server, and are given Actions back to animate/execute.
    - Every turn, the entire state of the battle will need to be updated. Because this'll only happen once every couple seconds at most, even if it is a lot of data it probably won't be too slow. All Battlers must be kept current every turn or the game may de-sync.
        - BattleController will not be responsible for networking and keeping a session in-sync, but applying data obtained from a server such as states and Actions.
- You'll need turn-timers? And of course, all the player connection/disconnection required for any online game. Also a chat and other administrative features.

Will you re-use client code in the server instance? You'll probably have to... For example, different templates, moves, etc. must be tracked by the server and not provided by clients when they connect, or the game would be a mess. **At what point will the client and server codebases diverge?**

Oh man, this gonna be tricky.

You'll have to import client code and find a way to run it in the context of a server. You will also need to make it so battles can be run completely just by text - in the context of a command line.

# To-do

- Moves/Special - set up classes, write necessary documentation bits, and standardize the language - say "special moves" rather than "elemental" moves.
- Plan out battle flow - this is a necessary step. build a basic skeleton for BattleController
    - Ex. who attacks when?
    - What data is provided to BattleControllerEvent and BattlerEvent?
- Begin restructuring source for a server component as well
    - Idea file structure:
        - ```src/client``` Modules used only by the client, such as GL setup, sprites, sounds, effects, and connecting to servers.
        - ```src/server``` Modules used only by the server, such as commandline, configuration, and receiving connections.
        - ```src/common``` Modules used by both client and server, such as game information, BattleControllers, Battlers, data with init/deinit/use, etc.
    - All classes that run important game information (like BattleController and Battler) should have a "puppet" flag, which will only let them get data over the network when active. So they can be used both in offline singleplayer, or online, with minimal difference. Most code will probably go in here, as it should be almost entirely dual-purposed for a commandline or a browser environment.
- Make battle simulation (a battle with no clients, run in node only)
    - All classes that return promises (like Timelines and Actions) should resolve immediately
- Set up testing suite and run test battles

init and deinit are provided full access to the BattleController and every Battler present - so they can add events to virtually anything, anywhere.
Weapons: init and deinit
Equipment: init and deinit
Accessories: init and deinit
Inventory Items: use

- Design battle HUD?