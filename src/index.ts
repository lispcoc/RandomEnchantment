import { TESModPlatform, getPluginSourceCode, on, callNative, FormType, Game, Actor, Form, Enchantment, SlotMask, MagicEffect, Utility, Debug, once, writeLogs, printConsole, ObjectReference, Armor, Weapon, MiscObject, Container, Keyword } from '@skyrim-platform/skyrim-platform'
import * as MiscUtil from "./PapyrusUtil/MiscUtil";
import * as StorageUtil from "./PapyrusUtil/StorageUtil";
import EnchantList from "./EnchantList.json";

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

const mask_head = SlotMask.Head | SlotMask.Hair | SlotMask.Circlet;
const mask_hand = SlotMask.Hands | SlotMask.Forearms;

const restrictTransrator = [
    {word: "ArmorGauntlets", mask: mask_hand},
    {word: "ClothingHands", mask: mask_hand},
    {word: "ArmorHelmet", mask: mask_head},
    {word: "ClothingCirclet", mask: mask_head},
    {word: "ClothingHead", mask: mask_head},
    {word: "ClothingNecklace", mask: SlotMask.Amulet},
    {word: "ClothingRing", mask: SlotMask.Ring},
    {word: "ArmorShield", mask: SlotMask.Shield},
    {word: "ClothingBody", mask: SlotMask.Body},
    {word: "ArmorCuirass", mask: SlotMask.Body},
    {word: "ClothingFeet", mask: SlotMask.Feet},
    {word: "ArmorBoots", mask: SlotMask.Feet},
    {word: "WAF_ClothingCloak", mask: SlotMask.ChestOuter}
];

const armor_enchants = [
    {id: EnchantId.ResistShock,         mask: SlotMask.Amulet | SlotMask.Ring | SlotMask.Feet | SlotMask.Shield},
    {id: EnchantId.ResistPoison,        mask: SlotMask.Amulet | SlotMask.Body | SlotMask.Ring | SlotMask.Feet | SlotMask.Shield},
    {id: EnchantId.ResistMagic,         mask: SlotMask.Amulet | SlotMask.Ring | SlotMask.Shield},
    {id: EnchantId.ResistDisease,       mask: SlotMask.Amulet | SlotMask.Body | SlotMask.Ring | SlotMask.Feet | SlotMask.Shield},
    {id: EnchantId.ResistFrost,         mask: SlotMask.Amulet | SlotMask.Ring | SlotMask.Feet | SlotMask.Shield},
    {id: EnchantId.ResistFire,          mask: SlotMask.Amulet | SlotMask.Ring | SlotMask.Feet | SlotMask.Shield},
    {id: EnchantId.Muffle,              mask: SlotMask.Feet},
    {id: EnchantId.Waterbreathing,      mask: mask_head | SlotMask.Amulet | SlotMask.Ring},
    {id: EnchantId.FortifyTwoHanded,    mask: SlotMask.Amulet | mask_hand | SlotMask.Ring | SlotMask.Feet},
    {id: EnchantId.FortifySneak,        mask: SlotMask.Amulet | mask_hand | SlotMask.Ring | SlotMask.Feet},
    {id: EnchantId.FortifySmithing,     mask: SlotMask.Amulet | SlotMask.Body | mask_hand | SlotMask.Ring},
    {id: EnchantId.FortifyRestoration,  mask: mask_head | SlotMask.Amulet | SlotMask.Body | SlotMask.Ring},
    {id: EnchantId.FortifyPickpocket,   mask: SlotMask.Amulet | mask_hand | SlotMask.Ring | SlotMask.Feet},
    {id: EnchantId.FortifySneak,        mask: SlotMask.Amulet | mask_hand | SlotMask.Ring | SlotMask.Feet},
    {id: EnchantId.FortifyLockpicking,  mask: mask_head | SlotMask.Amulet | mask_hand | SlotMask.Ring},
    {id: EnchantId.FortifyLightArmor,   mask: SlotMask.Amulet | SlotMask.Body | mask_hand | SlotMask.Ring},
    {id: EnchantId.FortifyIllusion,     mask: mask_head | SlotMask.Amulet | SlotMask.Body | SlotMask.Ring},
    {id: EnchantId.FortifyHeavyArmor,   mask: SlotMask.Amulet | SlotMask.Body | mask_hand | SlotMask.Ring},
    {id: EnchantId.FortifyDestruction,  mask: mask_head | SlotMask.Amulet | SlotMask.Body | SlotMask.Ring},
    {id: EnchantId.FortifyConjuration,  mask: mask_head | SlotMask.Amulet | SlotMask.Body | SlotMask.Ring},
    {id: EnchantId.FortifyBlock,        mask: SlotMask.Amulet | mask_hand | SlotMask.Ring | SlotMask.Shield},
    {id: EnchantId.FortifyBarter,       mask: SlotMask.Amulet},
    {id: EnchantId.FortifyArchery,      mask: mask_head | SlotMask.Amulet | mask_hand | SlotMask.Ring},
    {id: EnchantId.FortifyAlteration,   mask: mask_head | SlotMask.Amulet | SlotMask.Body | SlotMask.Ring},
    {id: EnchantId.FortifyAlchemy,      mask: mask_head | SlotMask.Amulet | mask_hand | SlotMask.Ring},
    {id: EnchantId.UnarmedDamage,       mask: mask_hand | SlotMask.Ring},
    {id: EnchantId.CarryWeight,         mask: SlotMask.Amulet | mask_hand | SlotMask.Ring | SlotMask.Feet},
    {id: EnchantId.RegenerateStamina,   mask: SlotMask.Amulet | SlotMask.Body | SlotMask.Ring | SlotMask.Feet},
    {id: EnchantId.FortifyStamina,      mask: SlotMask.Amulet | SlotMask.Body | SlotMask.Ring | SlotMask.Feet},
    {id: EnchantId.RegenerateMagicka,   mask: mask_head | SlotMask.Body | SlotMask.Ring},
    {id: EnchantId.FortifyMagicka,      mask: mask_head | SlotMask.Amulet | mask_hand | SlotMask.Ring},
    {id: EnchantId.FortifyHealth,       mask: SlotMask.Amulet | SlotMask.Body | SlotMask.Ring | SlotMask.Feet | SlotMask.Shield},
    {id: EnchantId.RegenerateHealth,    mask: SlotMask.Amulet | SlotMask.Body | SlotMask.Ring | SlotMask.Feet},
];

var enchant_list : {name: string, id: number, restrict: string[], valid: boolean} [] = [];

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
    return StorageUtil.GetIntValue(f, "random-enchantment_proceeded", 0) > 0;
}

const doEnchant = () => {
    return rng(0, 100) < 10;
}

const genEncAndArgStr = (item : Form, q : number) => {
    var multiplier = getMultiplier(q);
    var num = getNumEnchant(q);
    var magics: number[] = [];
    var mags: number[] = [];
    var areas: number[] = [];
    var durs: number[] = [];

    var armor = Armor.from(item);
    var weapon = Weapon.from(item);
    if(armor) {
        var filtered_a_enc = enchant_list.filter(e => {
            if(!e.valid || !Enchantment.from(Game.getFormEx(e.id))) return false;
            var mask = 0;
            e.restrict.forEach(r => {
                var obj = restrictTransrator.find(r2 => r2.word == r);
                if(obj) mask |= obj.mask;
            });
            return (armor!.getSlotMask() & mask) != 0;
        });
        if(filtered_a_enc.length) {
            for(; num > 0; num--) {
                var enc_id = filtered_a_enc[rng(0, filtered_a_enc.length)].id;
                var enc = Enchantment.from(Game.getFormEx(enc_id));
                if(!enc) continue;
                for(var i = 0; i < enc.getNumEffects(); i++) {
                    var m = enc.getNthEffectMagicEffect(i)!;
                    if(magics.find(e => e == m.getFormID())) continue;
                    magics.push(m.getFormID());
                    mags.push(enc.getNthEffectMagnitude(i) * multiplier);
                    areas.push(enc.getNthEffectArea(i));
                    durs.push(enc.getNthEffectDuration(i) * multiplier);
                }
            }
            return genArgStr(3000, magics, mags, areas, durs);
        }
    } else if(weapon) {
        var filtered_w_enc = enchant_list.filter(e => {
            if(!e.valid || !Enchantment.from(Game.getFormEx(e.id))) return false;
            return e.restrict.length == 0;
        });
        if(filtered_w_enc.length) {
            for(; num > 0; num--) {
                var enc_id = filtered_w_enc[rng(0, filtered_w_enc.length)].id;
                var enc = Enchantment.from(Game.getFormEx(enc_id));
                if(!enc) continue;
                for(var i = 0; i < enc.getNumEffects(); i++) {
                    var m = enc.getNthEffectMagicEffect(i)!;
                    if(magics.find(e => e == m.getFormID())) continue;
                    magics.push(m.getFormID());
                    mags.push(enc.getNthEffectMagnitude(i) * multiplier);
                    areas.push(enc.getNthEffectArea(i));
                    durs.push(enc.getNthEffectDuration(i) * multiplier);
                }
            }
            return genArgStr(3000, magics, mags, areas, durs);
        }
    }
    return null;
}

const genArgStr = (charge : number, magics : number[], mags : number[], areas : number[], durs : number[]) => {
    return charge + "|" + [magics.join(":"), mags.join(":"), areas.join(":"), durs.join(":")].join(",");
}

const rng = (min : number, max : number) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

const genEnchantObj = () => {
    return ObjectReference.from(Game.getFormFromFile(0x00000803, "RandomEnchantment.esp"));
}

var stall = true;
var enchant_buffer : {id: number, enc_id : number}[] = [];

const mainloop = () => {
    if (!stall) {
        stall = true;
        main();
        Utility.wait(5).then(() => {
            stall = false;
        })
    }
}

const main = () => {
    var player : Actor = Game.getPlayer()!;
    var level = player.getLevel() > 50 ? 50 : player.getLevel();
    var actors : Actor[] = MiscUtil.ScanCellNPCs(player);
    actors.forEach(a => {
        for(var mask = 1; mask <= 0x8000000; mask = mask << 1) {
            if(!doEnchant()) continue;
            var armor = a.getWornForm(mask);
            if (!armor) continue;
            if(getAlreadyProceed(armor)) continue;
            setAlreadyProceed(armor);
            if(!doEnchant()) return;
            var enc = Enchantment.from(callNative("WornObject", "GetEnchantment", undefined, a, 0, mask));
            if(enc) continue;
            var str = genEncAndArgStr(armor, randomizeQuality(getBaseQuality(level)));
            if(!str) return;
            printConsole([armor.getName(), str].join(":"));
            a.sendModEvent("RandomEnchantment_ArmorCreateEnchantment", str, mask);
        }
        for(var hand = 0; hand < 2; hand++) {
            if(!doEnchant()) continue;
            var handitem = a.getEquippedObject(hand);
            if (!handitem) continue;
            if(getAlreadyProceed(handitem)) continue;
            setAlreadyProceed(handitem);
            if(!doEnchant()) return;
            var enc = Enchantment.from(callNative("WornObject", "GetEnchantment", undefined, a, hand, 0));
            if(enc) continue;
            var str = genEncAndArgStr(handitem, randomizeQuality(getBaseQuality(level)));
            if(!str) return;
            printConsole([handitem.getName(), str].join(":"));
            a.sendModEvent("RandomEnchantment_WeaponCreateEnchantment", str, hand);
        }
    });
    MiscUtil.ScanCellObjects(FormType.Armor, player).forEach(obj => {
        var base = Armor.from(obj.getBaseObject()!);
        if (!base) return;
        if(getAlreadyProceed(base)) return;
        setAlreadyProceed(base);
        if(!doEnchant()) return;
        if(obj.getEnchantment()) return;
        var str = genEncAndArgStr(base, randomizeQuality(getBaseQuality(level)));
        if(!str) return;
        printConsole([base.getName(), str].join(":"));
        obj.sendModEvent("RandomEnchantment_ObjCreateEnchantment", str, 0);
    });
    MiscUtil.ScanCellObjects(FormType.Weapon, player).forEach(obj => {
        var base = Weapon.from(obj.getBaseObject()!);
        if (!base) return;
        if(getAlreadyProceed(base)) return;
        setAlreadyProceed(base);
        if(!doEnchant()) return;
        if(obj.getEnchantment()) return;
        var str = genEncAndArgStr(base, randomizeQuality(getBaseQuality(level)));
        if(!str) return;
        printConsole([base.getName(), str].join(":"));
        obj.sendModEvent("RandomEnchantment_ObjCreateEnchantment", str, 0);
    });
    MiscUtil.ScanCellObjects(FormType.Container, player).forEach(obj => {
        var forms = obj.getContainerForms();
        forms?.forEach(f => {
            var armor = Armor.from(f);
            var weapon = Weapon.from(f);
            var str : string | null = null;
            if(armor && !getAlreadyProceed(armor) && !armor.getEnchantment()) {
                setAlreadyProceed(armor);
                if(!doEnchant()) return;
                str = genEncAndArgStr(armor, randomizeQuality(getBaseQuality(level)));
            }
            if(weapon && !getAlreadyProceed(weapon) && !weapon.getEnchantment()) {
                setAlreadyProceed(weapon);
                if(!doEnchant()) return;
                str = genEncAndArgStr(weapon, randomizeQuality(getBaseQuality(level)));
            }
            if(str) {
                printConsole([Form.from(f)!.getName(), str].join(":"));
                genEnchantObj()!.sendModEvent("RandomEnchantment_ContainerEnchantment", str, Form.from(f)!.getFormID());
                enchant_buffer.push({id:Form.from(f)!.getFormID()!, enc_id: 0});
            }
            if (armor || weapon) {
                var item = Form.from(f)!;
                var b = enchant_buffer.find(b => b.id == item.getFormID());
                if(!b || !b.enc_id) return;
                var enc = Enchantment.from(Game.getFormEx(b.enc_id));
                if (!enc) return;
                TESModPlatform.addItemEx(obj, item, 1, 1, enc, 3000, false, 100, item.getName(), 0, null, 0 );
                obj.removeItem(Form.from(f)!, 1, false, null);
                enchant_buffer = enchant_buffer.filter(b2 => b2.id != b!.id);
            }
        });
    });
}

on('modEvent', (event) => {
    if(event.eventName == "RandomEnchantment_Ready") {
        stall = false;
    }
    if(event.eventName == "RandomEnchantment_ContainerEnchantmentReturn") {
        var enc = Form.from(event.sender);
        var item_id = event.numArg;
        var enc_id = parseInt(event.strArg);
        var b = enchant_buffer.find(b => b.id == item_id);
        if(b) b.enc_id = enc?.getFormID()!;
    }
});

on('update', () => {
    if(Utility.isInMenuMode()) return;
    mainloop();
})

once('update', () => {
    EnchantList.forEach(e => {
        var obj : {
            name: string;
            id: number;
            restrict: string[];
            valid: boolean;
        } = {
            name: e.name,
            id: parseInt(e.id, 16),
            restrict: [],
            valid: e.base
        };
        var enc = Enchantment.from(Game.getFormEx(obj.id));
        if(enc) {
            var flist = enc.getKeywordRestrictions();
            if(flist) {
                var i = 0;
                while(flist.getAt(i)) {
                    var kwd = Keyword.from(flist.getAt(i)!);
                    if(kwd?.getString()) obj.restrict.push(kwd?.getString()!);
                    i++;
                }
            }
            if(e.restrict_mod) {
                e.restrict_mod.forEach(r => obj.restrict.push(r));
            }
            enchant_list.push(obj);
        }
    });
    writeLogs("test-mod", JSON.stringify(enchant_list, null, "    "));
    return;
    printConsole("search enchants");
    for(var n = 0x1000; n < 0xF00000; n++) {
        try {
            var frm = Game.getFormEx(n);
            if(frm) {
                var enc = Enchantment.from(frm);
                if(enc) {
                    var j = {
                        name: enc!.getName(),
                        id: n.toString(16),
                        base: !(enc!.getBaseEnchantment())
                    };
                    writeLogs("test-mod", JSON.stringify(j));
                }
            }
        } catch(e) {
        }
    }
})
