Scriptname RandomEnchantment extends Quest
Event OnInit()
    RegisterEvents()
    sendModEvent("RandomEnchantment_Ready", "", 0)
EndEvent

Function RegisterEvents()
    RegisterForModEvent("RandomEnchantment_WeaponCreateEnchantment", "OnWeaponCreateEnchantment")
    RegisterForModEvent("RandomEnchantment_ArmorCreateEnchantment", "OnArmorCreateEnchantment")
    RegisterForModEvent("RandomEnchantment_ObjCreateEnchantment", "OnObjCreateEnchantment")
    RegisterForModEvent("RandomEnchantment_ContainerEnchantment", "OnContainerEnchantment")
EndFunction

Event OnWeaponCreateEnchantment(string eventName, string strArg, float hand, Form sender)
    EnchantWornObj(sender as Actor, hand as int, 0, strArg)
EndEvent

Event OnArmorCreateEnchantment(string eventName, string strArg, float mask, Form sender)
    EnchantWornObj(sender as Actor, 0, mask as int, strArg)
EndEvent

Event OnObjCreateEnchantment(string eventName, string strArg, float no_use, Form sender)
    EnchantObj(sender as ObjectReference, strArg)
EndEvent

Event OnContainerEnchantment(string eventName, string strArg, float id, Form sender)
    ObjectReference obj = sender as ObjectReference
    If obj != None
        EnchantObj(obj, strArg, true)
        If obj.GetEnchantment() != None
            obj.GetEnchantment().sendModEvent("RandomEnchantment_ContainerEnchantmentReturn", obj.GetEnchantment().GetFormID(), id)
        endIf
    endIf
EndEvent

Function EnchantObj(ObjectReference obj, string strArg, bool force = false)
    If obj != None
        If !force && obj.GetEnchantment() != None
            return
        endIf
        String[] str_array1 = StringUtil.Split(strArg, "|")
        int charge = str_array1[0] as int
        String[] str_array2 = StringUtil.Split(str_array1[1], ",")
        String[] str_magics = StringUtil.Split(str_array2[0], ":")
        String[] str_mags = StringUtil.Split(str_array2[1], ":")
        String[] str_areas = StringUtil.Split(str_array2[2], ":")
        String[] str_durs = StringUtil.Split(str_array2[3], ":")

        MagicEffect[] magics;
        If (str_magics.length == 1)
            magics = new MagicEffect[1]
        ElseIf (str_magics.length == 2)
            magics = new MagicEffect[2]
        ElseIf (str_magics.length >= 3)
            magics = new MagicEffect[3]
        Else
            return
        endIf
        Int i = 0
        While i < magics.Length
            magics[i] = Game.GetFormEx(str_magics[i] as Int) as MagicEffect
            i = i + 1
        endWhile

        Float[] mags = Utility.CreateFloatArray(magics.length)
        Int[] areas = Utility.CreateIntArray(magics.length)
        Int[] durs = Utility.CreateIntArray(magics.length)
        i = 0
        While i < magics.Length
            mags[i] = (str_mags[i] as Float)
            areas[i] = (str_areas[i] as Int)
            durs[i] = (str_durs[i] as Int)
            i = i + 1
        endWhile

        obj.CreateEnchantment(charge, magics, mags, areas, durs)
    endIf
EndFunction

Function EnchantWornObj(Actor a, int hand, int mask, string strArg)
    If a != None
        String[] str_array1 = StringUtil.Split(strArg, "|")
        int charge = str_array1[0] as int
        String[] str_array2 = StringUtil.Split(str_array1[1], ",")
        String[] str_magics = StringUtil.Split(str_array2[0], ":")
        String[] str_mags = StringUtil.Split(str_array2[1], ":")
        String[] str_areas = StringUtil.Split(str_array2[2], ":")
        String[] str_durs = StringUtil.Split(str_array2[3], ":")

        MagicEffect[] magics;
        If (str_magics.length == 1)
            magics = new MagicEffect[1]
        ElseIf (str_magics.length == 2)
            magics = new MagicEffect[2]
        ElseIf (str_magics.length >= 3)
            magics = new MagicEffect[3]
        Else
             return
        endIf
        Int i = 0
        While i < magics.Length
            magics[i] = Game.GetFormEx(str_magics[i] as Int) as MagicEffect
            i = i + 1
        endWhile

        Float[] mags = Utility.CreateFloatArray(magics.length)
        Int[] areas = Utility.CreateIntArray(magics.length)
        Int[] durs = Utility.CreateIntArray(magics.length)
        i = 0
        While i < magics.Length
            mags[i] = (str_mags[i] as Float)
            areas[i] = (str_areas[i] as Int)
            durs[i] = (str_durs[i] as Int)
            i = i + 1
        endWhile

        WornObject.CreateEnchantment(a, hand, mask, charge, magics, mags, areas, durs)
    endIf
EndFunction
