import { FormType, Game, Actor, Form, Enchantment, Weapon, Utility, Debug, once, printConsole, ObjectReference } from 'skyrimPlatform'
import * as MiscUtil from "./PapyrusUtil/MiscUtil";

const getBaseQuality = (level : number) => {
    return Math.floor(level/ 5);
}

const getNumEnchant = (quality : number) => {
    const list = [
        [90, 10, 0], //~1
        [90, 10, 0], //~3
        [90, 10, 0], //~5
        [80, 20, 0], //~7
        [70, 29, 1], //~9
        [60, 35, 5], //~11
        [55, 40, 5], //~13
        [50, 40, 10], //~15
    ];
    var n = Math.min(Math.max(Math.floor(quality / 2), 0), list.length - 1);
    var res = Math.random() * 100;
    return list[n].findIndex(e => {
        res -= e;
        return res < 0;
    }) + 1;
}

const randomizeQuality = (center : number) => {
    const list = [
        {wgt: 10, mod: -2},
        {wgt: 20, mod: -1},
        {wgt: 40, mod: 0},
        {wgt: 15, mod: 1},
        {wgt: 10, mod: 2},
        {wgt: 4, mod: 3},
        {wgt: 1, mod: 4},
    ];
    var wgt = 0;
    list.forEach(e => wgt += e.wgt);
    wgt = Math.random() * wgt;
    var res = list.find(e => {
        wgt -= e.wgt;
        return wgt < 0;
    }) || list[list.length - 1];
    return Math.max(res.mod + center, 0);
}

const getMultiplier = (quality : number) => {
    // Grand	x1
    // Greater	x2/3
    // Common	x1/3
    // Lesser	x1/6
    // Petty	x1/12
    // Maximum possible natural (without potions) multiplier with 100 Enchanting, 5 levels in Enchanter, appropriate +25% perk and Grand soul is 3.125x.
    // With potions (without exploiting fortify restoration effect) the maximum is 4.21875x.
    const list = [
        0.5, // 0
        0.75, // 1
        1.0, // 2
        1.25, // 3
        1.5, // 4
        1.75, // 5
        2.0, // 6
        2.25, // 7
        2.5, // 8
        2.75, // 9
        3.0, // 10
        3.5, // 11
        4.0, // 12
        4.22, // 13 = about Vanilla Peak
        4.5, // 14
        5.0, // 15
    ];
    quality = Math.max(quality, 0);
    quality = Math.min(quality, list.length - 1);
    return list[quality];
}

const enchants = [0x000424e2];

const mainloop = async () => {
    var player = Game.getPlayer()!;
    var actors : Actor[] = MiscUtil.ScanCellNPCs(player);
    actors.forEach(a => {
        var level = a.getLevel();
        var items : ObjectReference[] = [];
        var tmp : Form | null = a.getEquippedWeapon(false);
        if(tmp != null) items.push(ObjectReference.from(tmp)!);
        tmp = a.getEquippedWeapon(true);
        if(tmp) items.push(ObjectReference.from(tmp)!);
        for(var mask = 1; mask <= 0x8000000; mask << 1) {
            tmp = a.getWornForm(mask);
            if(tmp) items.push(ObjectReference.from(tmp)!);
        }
        items.forEach(item => {
            printConsole(item.getName());
            if(!item.getEnchantment()) {
                var enc = Enchantment.from(Game.getForm(enchants[0]));
                if(enc) {
                    var magic = enc.getNthEffectMagicEffect(0);
                    var base_mag = enc.getNthEffectMagnitude(0);
                    var base_area = enc.getNthEffectArea(0);
                    var base_dur = enc.getNthEffectDuration(0);
                    var multiplier = getMultiplier(randomizeQuality(getBaseQuality(level)));
                    if(magic){
                        item.getItemHealthPercent()
                        if(item.getType() == FormType.Armor) {
                            item.createEnchantment(3000, [magic], [base_mag * multiplier], [base_area], [base_dur]);
                        }
                    }
                }
            }
        });
    })
    await Utility.wait(1);
    mainloop ();
}

once('tick', () => {
    printConsole('Hello! You can view this in the Skyrim ~ console on the Main Menu when the game runs')
})

once('update', () => {
    Debug.messageBox('Hello! This will appear when a new game is started or an existing game is loaded')
    mainloop();
})
