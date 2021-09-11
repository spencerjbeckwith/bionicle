# BIONICLE

## Development Environment

- You must run `npm install` before using this package.
- NPM script `buildClient` will watch the source directory and client files to compile/rollup your Typescript for the web client.
- NPM script `buildServer` will watch the source directory and server files to compile/rollup your Typescript for the server instance.
- NPM script `host` will host a local webserver, serving your game files, and will open your browser to the page.
- NPM script `watch` will watch the images asset folder and will recompile your atlas (via the `atlas` script) automatically when a change is detected. If you've also run `build` this change will then trigger that as well.
- NPM script `test` runs (and watches) the test files located alongside source files.

Running these scripts together ensures a smooth development process. When saving an image or Typescript, the only thing you must do to run the game is refresh your browser page. I recommend setting up a vscode task that will run all these scripts at once and open them all parallel to each other in the same terminal.

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

> You've surely heard of callback hell before, but now get ready to enter... *promise hell*.

## Battlers

Every fighter in a conflict is represented by a Battler instance. These are managed by a BattleController instance.

Each Battler follows a BattlerTemplate - a predefined "skeleton" of sorts, determining things like base stats, sprite information, elements, palettes, masks, etc. These work very well for enemies, because they should be generated at the start of a battle, but a different approach is taken for players: Player Battler instances must be referenced outside of a BattleController, because their templates must not be referenced anywhere but as part of the Battler itself. This is because their templates must change and mutate, such as when a player levels up - while all enemy templates must remain static and may not change.

Since player Battlers persist, you must be diligent to cure them of statuses, fix their stats when needed, and run the appropriate init/deinit methods when needed - because these instances are not forgotten.

## init, deinit, and use methods

Both Battlers and BattleControllers are PromisedEventTargets (see below) which is just a variation of a regular EventTarget. Different moves, equipment, masks, and status effects all do different and complex things - so each is provided with an init and a deinit function when they're defined (at game start). These functions should add event handlers for all the events they want to change to either Battler(s) or the BattleController. The listeners are provided the event instance, and must return promises that resolve to the same event. This way, events can also be mutated by different listeners.

For example, a "poison" status effect would have an init function that would add a "turnBegin" event to the affected Battler (must provided when init is called for a status) and in that event, an animation or sound might play along with the HP being subtracted.

Once that status is no longer active - like if the battle has ended, the status has expired or was cured, the battler has died, etc. then the deinit is called, which in this case, must remove the poison handler from the "turnBegin" event on that battler.

This sytem allows for flexible, complex, and unique effects for every mask, status, or piece of equipment. However, it is critical that these methods are called when necessary or you may end up with leftover events that don't make sense and can't be removed! Imagine you think you're cured of poison - but just turns out you've got poison forever because deinit wasn't called right.

This system of init/deinit is also reflected in the file structure: the "battle" folder has the actual code for things like Battlers and the BattleController, which call the init/deinit methods and dispatch events. The top-level files in the "data" folder export lists of things such as masks, statuses, etc. which pull in those init and deinit methods from the deeper level folders - so that each unique effect can have its own file and can be worked on without any one file becoming too chonky. This also should make it easier to focus and refine singular listeners.

The main difference between the PromisedEventTargets and regular EventTargets is that PromisedEventTargets listeners must return promises - these are all evaluated in order and wait for one another to complete before moving on. This should make it easy for sequential battle events to occur, as opposed to everything at once.

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

## Netplay

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

## "Promised" Events

For better flow during a battle, there is a variation of EventTarget that events can be added to which must return a promise. Rather than execute all events simultaneously, they are called in order and the next event will not be executed until earlier promises resolve. This way, you can chain multiple animations or effects at once and rest assured they will occur in order. This is where init/deinit should add their event listeners. If any promise in the event rejects, then the rest of the listeners (those with lower priority, or that were added later) will not be called. Dispatching events now returns a promise - which you should either use ```.then```, ```.finally```, and/or ```.catch``` on.

Promised event listeners can also take a priority - higher priority listeners happen before those with lower priority, though they all will still happen. You can also specify for an event to happen once, after which the listener is removed.

For example: an accessory has an effect every time you attack with it. The accessory's init function adds a promised event to that event type, while deinit removes it. A mask also has an effect every time you attack, so it adds a promised event listener the same way. When the attack happens, both events happen in order (if priority is given) or in the order the listeners were added.

Note that **you should not use ```async/await``` for these events except for in testing.** This is because ```async/await``` will make everything pause until the promise resolves, which is impossible if things are paused as most PromisedEvents depend, under normal circumstances, on any number of future animation frames. If execution pauses, the frames will not happen naturally and so the promises will, unintuitively, never resolve. However, ```async/await``` are incredibly useful in a testing situation as you won't need to chain ```.then``` every time you want to use a promise. You can also set the ```instantaneous``` flag of PromisedEvents to resolve them and their effects immediately - just make sure you implement support for ```instantaneous``` every time you add events to a PromisedEventTarget. But even instantaneous promises wait for a full JavaScript loop to complete before resolving, so you'll still need either ```.then``` or ```async/await```.

**Also note that all PromisedEvent listeners must return a promise of their own and resolve to an event instance.** To resolve events of different types, you may need to call and use their promises and then ```resolve()``` your outer promise in the ```.then()``` call of the different event. These promises resolve to the event, that way you can mutate the event through different listeners - such as changing the damage of an attack or the turns of an applied status.

### Writing PromisedEvent Promises/Listeners

- Always handle the ```instantaneous``` property of PromisedEvents. It should not run any frame-by-frame effects and it should make it possible to run battles via node, and not just in browser... all should resolve immediately. No need for a new animation frame.
- Always be mindful of what type of events you resolve to. Events of different types can not share the same promise chain - you may need to nest promises within each other if one event depends on the completion of another.
- Listeners may mutate events as they see fit. There is no way to know exactly what listeners have occured by the time a dispatched event promise fully resolves
- Always use ```.catch``` everytime you use a promise! Don't allow errors to pass through. However, if a listener rejects, it cancels all further listeners on an event from firing. If you have listeners that you know may reject, it may be best to let them fail silently. You could use ```.finally()``` to continue execution regardless.

## Anatomy of a Battle Round

*In a nutshell... Since most methods on Battlers are asynchronous and return promises, you end with promises waiting on promises waiting on promises... turtles all the way down. It's the most repulsive Russian nesting-doll situation you've ever seen.*

An important terminology distinction to make is that a "turn" refers to a single Battler doing their Action, while a "round" refers to every Battler doing all their Actions. Each Battler gets one Action per round, and only one turn per round as well. The distinction exists because BattlerBeginRoundEvent and BattlerBeginTurnEvent (and their "after" counterparts) fire at different times.

As for the real series of events in a battle round, it's actually pretty nasty. BattleController calls ```startRound()```, which does the following:
    - Asynchronously get the Actions of every Battler that Round via ```Battler.determineAction()```
    - Order the Battler's according to their speed
    - Fire every Battler's BattlerBeginRoundEvent, in speed order
    - Run every Battler's BattlerBeginTurnEvent and then their Action, via ```BattlerController.doActions()```
        - Depending on the Action, other Battler's BattlerBeforeAffectedEvent, BattlerDamageEvent, BattlerHealEvent, BattlerStatusAppliedEvent, BattlerStatusRemovedEvent, BattlerKnockOutEvent, BattlerAfterAffectedEvents, etc. may fire
        - Finally, run the Battler's BattlerEndTurnEvent after the Action is complete
        - Repeat for each subsequent Battler
    - Fire every Battler's BattlerRoundEndEvent, in (a potentially different) speed order
    - Then depending on the reuslt of ```doActions()```, ```startRound()``` may be called again. If not, the battle ends.

So to start a battle, ```startRound()``` is all that needs to be called and it will recursively call itself via its abominable and infinite promise chain. Keep in mind that *every single event that fires* (as well as most flow functions) is a new Promise. They're literally everywhere, but I still beleive this is the best approach to handling asynchronous network battles in sequential orders with a dynamic event, effect, and timeline system.

*Any rejection anywhere in the chain may break the entire battle, so be careful and be sure to use ```.finally()``` and make sure you always catch and handle rejections appropriately!*

# To-do

- Implement Actions
- Write a test for BattleController.startRound()
- Should BattleController dispatch any events? Does it need to extend the PromisedEventTarget at all?
- Where does randomness come from when executing actions? Netcode-wise...
    - BattleController's startRound() should only be called server-side:
        - determineAction, on server-side Battler instances, should await a valid network response
        - once all Actions come in (or time expires?) send all actions to the clients - AFTER RE-RANDOMIZING THEM!
        - puppet BattleControllers should then call doActions() once they get the actions
        - server BattleController determines win condition, and if no win, send out updated Battlers and battle state (just to re-sync every turn)
- How are Actions and Battlers sent over the network?
- Make battle simulation (a battle with no clients, run in node only)
    - All classes that return promises (like Timelines and Actions) should resolve immediately
- Design battle hud
- How does Client call BattleController and Battler?
    - Begin making client

- Keep in mind how networking is gonna handle this (and all these promises)