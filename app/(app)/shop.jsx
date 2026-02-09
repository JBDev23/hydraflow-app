import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import Hydra from '../../components/Hydra';
import GradientIcon from '../../components/GradientIcon';
import { FontAwesome6 } from '@expo/vector-icons';
import ShopItem from '../../components/ShopItem';
import Drop from "../../assets/Drop.svg"
import { useTheme } from '../../context/ThemeContext';
import { useGlobal } from '../../context/GlobalContext';
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const SKIN_LIST = [
  { id: "sunGlasses", category: "glasses", name: "Gafas de sol", price: 5 },
  { id: "pinkGlasses", category: "glasses", name: "Gafas rosas", price: 8 },
  { id: "hat1", category: "hat", name: "Gorro", price: 8 },
  { id: "hat2", category: "hat", name: "Sombrero", price: 10 },
  { id: "bowTie", category: "neck", name: "Pajarita", price: 12 },
  { id: "ribbon", category: "hat", name: "Lazo", price: 12 },
]

export default function Shop() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { userProfile, updateUserProfile } = useGlobal()

  const ownedSkins = userProfile?.skins?.owned || [];
  const equipedSkins = userProfile?.skins?.equiped || [];
  const drops = userProfile?.stats?.drops || 0;
  const skinCount = userProfile?.stats?.skins || 0;

  const handleEquip = (newItemId) => {
    let newEquipedList = [...equipedSkins];

    if (newEquipedList.includes(newItemId)) {
      newEquipedList = newEquipedList.filter(id => id !== newItemId);
    } else {
      const newItem = SKIN_LIST.find(item => item.id === newItemId);

      if (newItem) {
        newEquipedList = newEquipedList.filter(equippedId => {
          const equippedItem = SKIN_LIST.find(item => item.id === equippedId);
          return equippedItem && equippedItem.category !== newItem.category;
        });
        newEquipedList.push(newItemId);
      }
    }

    updateUserProfile({
      skins: {
        owned: ownedSkins,
        equiped: newEquipedList
      }
    });
  };

  const handleBuy = (itemId) => {
    let newOwnedList = [...ownedSkins];
    let newDrops = drops

    if (newOwnedList.includes(itemId)) {
      newOwnedList = newOwnedList.filter(id => id !== itemId);
    } else {
      newOwnedList.push(itemId);

      const price = SKIN_LIST.find(i => i.id === itemId).price;
      if (newDrops >= 0) {
        newDrops = drops - price;
      }

    }

    updateUserProfile({
      skins: {
        owned: newOwnedList,
        equiped: equipedSkins
      },
      stats: {
        ...userProfile.stats,
        drops: newDrops
      }
    });
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.upperContainer}>
        <View style={{ width: "42%" }}>
          <Hydra height={screenWidth * 0.4} showSkins={true} />
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statText}>Trajes:</Text>
            <View style={styles.statContainer}>
              <Text style={styles.statText}>{skinCount}</Text>
              <GradientIcon size={26} colors={['#FF01AA', '#A099FF']}>
                <FontAwesome6 size={21} name="shirt" />
              </GradientIcon>
            </View>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statText}>Drops:</Text>
            <View style={styles.statContainer}>
              <Text style={styles.statText}>{drops || 0}</Text>
              <Drop width={26} />
            </View>
          </View>
        </View>
      </View>
      <View style={styles.archievementsContainer}>
        {SKIN_LIST.map((skin) => {
          return (
            <ShopItem
              key={skin.id}
              width={screenWidth * 0.9 * 0.45 + 8}
              height={screenWidth * 0.9 * 0.45 + 8}
              data={{
                item: skin.id,
                name: skin.name,
                price: skin.price
              }}
              owned={ownedSkins.includes(skin.id)}
              equiped={equipedSkins.includes(skin.id)}
              handleEquip={handleEquip}
              handleBuyed={handleBuy}
            />
          )
        })}
      </View>
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    paddingBottom: "5%",
    paddingTop: "3%",
  },
  upperContainer: {
    flexDirection: "row",
    width: screenWidth * 0.9,
    alignSelf: "center",
    marginTop: "1%"
  },
  statsContainer: {
    width: "58%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  statContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5
  },
  texto: {
    fontFamily: theme.regular,
    color: theme.colors.text,
    fontSize: 25
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 4,
    borderColor: theme.colors.primary,
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 10
  },
  statText: {
    fontFamily: theme.regular,
    color: theme.colors.text,
    fontSize: 27,
  },
  archievementsContainer: {
    flex: 1,
    width: screenWidth * 0.9,
    alignSelf: "center",
    marginTop: "10%",
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  }
}); 