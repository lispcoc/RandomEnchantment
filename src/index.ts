import { FormType, Game, Actor, Form, Enchantment, SlotMask, MagicEffect, Utility, Debug, once, printConsole, ObjectReference, Armor, Weapon } from 'skyrimPlatform'
import * as MiscUtil from "./PapyrusUtil/MiscUtil";
import * as StorageUtil from "./PapyrusUtil/StorageUtil";

const enum EnchantId {
    ResistShock        = 0x00049295,
    ResistPoison       = 0x000ff15e,
    ResistMagic        = 0x000b7a35,
    ResistDisease      = 0x00100e60,
    ResistFrost        = 0x0003eaeb,
    ResistFire         = 0x00048c8b,
    Muffle             = 0x00092a57,
    Waterbreathing     = 0x00092a48,
    FortifyTwoHanded   = 0x0007a106,
    FortifySneak       = 0x0007a103,
    FortifySmithing    = 0x0007a102,
    FortifyRestoration = 0x0007a101,
    FortifyPickpocket  = 0x0007a100,
    FortifyOneHanded   = 0x0007a0ff,
    FortifyLockpicking = 0x0007a0fc,
    FortifyLightArmor  = 0x0007a0fb,
    FortifyIllusion    = 0x0007a0fa,
    FortifyHeavyArmor  = 0x0007a0f9,
    FortifyDestruction = 0x0007a0f6,
    FortifyConjuration = 0x0007a0f5,
    FortifyBlock       = 0x0007a0f3,
    FortifyBarter      = 0x0007a104,
    FortifyArchery     = 0x0007a0fe,
    FortifyAlteration  = 0x0007a0f2,
    FortifyAlchemy     = 0x0008b65c,
    UnarmedDamage      = 0x000424e2,
    CarryWeight        = 0x0007a0f4,
    RegenerateStamina  = 0x0007a105,
    FortifyStamina     = 0x00049507,
    RegenerateMagicka  = 0x0007a0fd,
    FortifyMagicka     = 0x00049504,
    FortifyHealth      = 0x000493aa,
    RegenerateHealth   = 0x0007a0f8,

    AbsorbHealth       = 0x000aa155,
    AbsorbStamina      = 0x000aa157,
    FireDamage         = 0x0004605a,
    DamageMagicka      = 0x0005b44f,
    ShockDamage        = 0x0004605c,
    DamageStamina      = 0x0005b450,
    Banish             = 0x000acbb5,
    Fear               = 0x0005b451,
    TurnUndead         = 0x0005b46b,
    Paralyze           = 0x000acbb6,
    SoulTrap           = 0x0005b452,
    BriarheartGeis     = 0x0010582e,
    FierySoulTrap      = 0x00040003,
    HuntsmansProwess   = 0x00105831,
    LightDamage        = 0x0003b0b1,
    SmithingExpertise  = 0x001019d6,
}

const weapon_enchants = [
    {id: EnchantId.AbsorbHealth},
    {id: EnchantId.ResistShock},
    {id: EnchantId.FireDamage},
    {id: EnchantId.DamageMagicka},
    {id: EnchantId.ShockDamage},
    {id: EnchantId.DamageStamina},
    {id: EnchantId.Banish},
    {id: EnchantId.Fear},
    {id: EnchantId.TurnUndead},
    {id: EnchantId.Paralyze},
    {id: EnchantId.SoulTrap},
    {id: EnchantId.BriarheartGeis},
    {id: EnchantId.FierySoulTrap},
    {id: EnchantId.HuntsmansProwess},
    {id: EnchantId.LightDamage},
    {id: EnchantId.SmithingExpertise},
];

const armor_enchants = [
    {id: EnchantId.ResistShock,         mask: SlotMask.Neck || SlotMask.Ring || SlotMask.Feet || SlotMask.Shield},
    {id: EnchantId.ResistPoison,        mask: SlotMask.Neck || SlotMask.ChestPrimary || SlotMask.ChestSecondary || SlotMask.Ring || SlotMask.Feet || SlotMask.Shield},
    {id: EnchantId.ResistMagic,         mask: SlotMask.Neck || SlotMask.Ring || SlotMask.Shield},
    {id: EnchantId.ResistDisease,       mask: SlotMask.Neck || SlotMask.ChestPrimary || SlotMask.ChestSecondary || SlotMask.Ring || SlotMask.Feet || SlotMask.Shield},
    {id: EnchantId.ResistFrost,         mask: SlotMask.Neck || SlotMask.Ring || SlotMask.Feet || SlotMask.Shield},
    {id: EnchantId.ResistFire,          mask: SlotMask.Neck || SlotMask.Ring || SlotMask.Feet || SlotMask.Shield},
    {id: EnchantId.Muffle,              mask: SlotMask.Feet},
    {id: EnchantId.Waterbreathing,      mask: SlotMask.Head || SlotMask.Neck || SlotMask.Ring},
    {id: EnchantId.FortifyTwoHanded,    mask: SlotMask.Neck || SlotMask.Hands || SlotMask.Ring || SlotMask.Feet},
    {id: EnchantId.FortifySneak,        mask: SlotMask.Neck || SlotMask.Hands || SlotMask.Ring || SlotMask.Feet},
    {id: EnchantId.FortifySmithing,     mask: SlotMask.Neck || SlotMask.ChestPrimary || SlotMask.ChestSecondary || SlotMask.Hands || SlotMask.Ring},
    {id: EnchantId.FortifyRestoration,  mask: SlotMask.Head || SlotMask.Neck || SlotMask.ChestPrimary || SlotMask.ChestSecondary || SlotMask.Ring},
    {id: EnchantId.FortifyPickpocket,   mask: SlotMask.Neck || SlotMask.Hands || SlotMask.Ring || SlotMask.Feet},
    {id: EnchantId.FortifySneak,        mask: SlotMask.Neck || SlotMask.Hands || SlotMask.Ring || SlotMask.Feet},
    {id: EnchantId.FortifyLockpicking,  mask: SlotMask.Head || SlotMask.Neck || SlotMask.Hands || SlotMask.Ring},
    {id: EnchantId.FortifyLightArmor,   mask: SlotMask.Neck || SlotMask.ChestPrimary || SlotMask.ChestSecondary || SlotMask.Hands || SlotMask.Ring},
    {id: EnchantId.FortifyIllusion,     mask: SlotMask.Head || SlotMask.Neck || SlotMask.ChestPrimary || SlotMask.ChestSecondary || SlotMask.Ring},
    {id: EnchantId.FortifyHeavyArmor,   mask: SlotMask.Neck || SlotMask.ChestPrimary || SlotMask.ChestSecondary || SlotMask.Hands || SlotMask.Ring},
    {id: EnchantId.FortifyDestruction,  mask: SlotMask.Head || SlotMask.Neck || SlotMask.ChestPrimary || SlotMask.ChestSecondary || SlotMask.Ring},
    {id: EnchantId.FortifyConjuration,  mask: SlotMask.Head || SlotMask.Neck || SlotMask.ChestPrimary || SlotMask.ChestSecondary || SlotMask.Ring},
    {id: EnchantId.FortifyBlock,        mask: SlotMask.Neck || SlotMask.Hands || SlotMask.Ring || SlotMask.Shield},
    {id: EnchantId.FortifyBarter,       mask: SlotMask.Neck},
    {id: EnchantId.FortifyArchery,      mask: SlotMask.Head || SlotMask.Neck || SlotMask.Hands || SlotMask.Ring},
    {id: EnchantId.FortifyAlteration,   mask: SlotMask.Head || SlotMask.Neck || SlotMask.ChestPrimary || SlotMask.ChestSecondary || SlotMask.Ring},
    {id: EnchantId.FortifyAlchemy,      mask: SlotMask.Head || SlotMask.Neck || SlotMask.Hands || SlotMask.Ring},
    {id: EnchantId.UnarmedDamage,       mask: SlotMask.Hands || SlotMask.Ring},
    {id: EnchantId.CarryWeight,         mask: SlotMask.Neck || SlotMask.Hands || SlotMask.Ring || SlotMask.Feet},
    {id: EnchantId.RegenerateStamina,   mask: SlotMask.Neck || SlotMask.ChestPrimary || SlotMask.ChestSecondary || SlotMask.Ring || SlotMask.Feet},
    {id: EnchantId.FortifyStamina,      mask: SlotMask.Neck || SlotMask.ChestPrimary || SlotMask.ChestSecondary || SlotMask.Ring || SlotMask.Feet},
    {id: EnchantId.RegenerateMagicka,   mask: SlotMask.Head || SlotMask.ChestPrimary || SlotMask.ChestSecondary || SlotMask.Ring},
    {id: EnchantId.FortifyMagicka,      mask: SlotMask.Head || SlotMask.Neck || SlotMask.Hands || SlotMask.Ring},
    {id: EnchantId.FortifyHealth,       mask: SlotMask.Neck || SlotMask.ChestPrimary || SlotMask.ChestSecondary || SlotMask.Ring || SlotMask.Feet || SlotMask.Shield},
    {id: EnchantId.RegenerateHealth,    mask: SlotMask.Neck || SlotMask.ChestPrimary || SlotMask.ChestSecondary || SlotMask.Ring || SlotMask.Feet},
];

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

const setAlreadyProceed = (f : Form) => {
    StorageUtil.SetIntValue(f, "random-enchantment_proceeded", 1);
}

const getAlreadyProceed = (f : Form) => {
    return StorageUtil.GetIntValue(f, "random-enchantment_proceeded", 1) > 0;
}

const rng = (min : number, max : number) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

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
            if(!item.getEnchantment() && !getAlreadyProceed(item)) {
                var enc : Enchantment | null = null;
                var a = Armor.from(item);
                var w = Weapon.from(item);
                if(item.getType() == FormType.Armor) {
                    var filtered = armor_enchants.filter(e => {
                        if(a == null) return false;
                        return (a.getSlotMask() & e.mask) != 0;
                    });
                    enc = Enchantment.from(Game.getForm(filtered[rng(0, filtered.length)].id));
                }
                if(item.getType() == FormType.Weapon) {
                    enc = Enchantment.from(Game.getForm(weapon_enchants[rng(0, weapon_enchants.length)].id));
                }
                if(enc) {
                    var multiplier = getMultiplier(randomizeQuality(getBaseQuality(level)));
                    var magics: MagicEffect[] = [];
                    var base_mags: number[] = [];
                    var base_areas: number[] = [];
                    var base_durs: number[] = [];
                    for( var i = 0; i < enc.getNumEffects(); i++){
                        if(enc.getNthEffectMagicEffect(i)) {
                            magics.push(enc.getNthEffectMagicEffect(i)!);
                            base_mags.push(enc.getNthEffectMagnitude(i) * multiplier);
                            base_areas.push(enc.getNthEffectArea(i));
                            base_durs.push(enc.getNthEffectDuration(i));
                        }
                    }
                    if(magics.length){
                        item.getItemHealthPercent();
                        item.createEnchantment(3000, magics, base_mags, base_areas, base_durs);
                        setAlreadyProceed(item);
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
