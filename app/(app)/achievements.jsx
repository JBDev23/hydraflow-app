import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useMemo } from 'react';
import Hydra from '../../components/Hydra';
import GradientIcon from '../../components/GradientIcon';
import { FontAwesome6 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Achievement from '../../components/Achievement';
import { useTheme } from '../../context/ThemeContext';
import { useGlobal } from '../../context/GlobalContext';
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const ACHIEVEMENT_LIST = [
  {icon: "droplet", name: "Hydra", description: "Registra tu primer vaso de agua", completed: true, date: "17/01/26"},
  {icon: "egg", name: "El Iniciado", description: "Completa tu meta diaria", completed: true, date: "18/01/26"},
  {icon: "", name: "", description: "", completed: false, date: ""},
  {icon: "", name: "", description: "", completed: false, date: ""},
  {icon: "", name: "", description: "", completed: false, date: ""},
  {icon: "", name: "", description: "", completed: false, date: ""},
]

export default function Achievements() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { userProfile } = useGlobal()

  const stats = userProfile?.stats || { level: 1, progress: 0, archievements: 0 };
  const achievementCount = stats.archievements || 0;
  const level = stats.level || 1;
  const progress = stats.progress || 0;

  return (
    <ScrollView style={{flex:1}} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.upperContainer}>
        <View style={{width: "42%"}}>
          <Hydra height={screenWidth*0.4} showSkins={true}/>
        </View>
        <View style={styles.levelContainer}>
          <View style={{width: "100%"}}>
            <Text style={styles.statText}>Nivel {level}</Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              style={[styles.progressFill, {width: `${progress}%`}]}
              colors={[theme.colors.primary, theme.colors.primaryDark]} 
              start={{x:0, y:0}}
              end={{x:1, y:0}}
            />
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statText}>Logros:</Text>
            <View style={styles.statContainer}>
              <Text style={styles.statText}>{achievementCount}</Text>
              <GradientIcon size={26} colors={['#FFD700', 'rgba(255,215,0,0.28)']}>
                <FontAwesome6 solid size={25} name="medal"/>
              </GradientIcon>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.achievementsContainer}>

        {ACHIEVEMENT_LIST.map((ach, i)=>{
          return(
            <Achievement 
              key={ach.name+i}
              width={screenWidth*0.9*0.48} 
              height={screenWidth*0.9*0.48} 
              data={{
                icon: ach.icon,
                name: ach.name,
                description: ach.description
              }} 
              isCompleted={ach.completed} 
              date={ach.date}
            />
          )
        })

        }        
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
    alignSelf: "center"
  },
  levelContainer : {
    width: "58%", 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "space-evenly"
  },
  statContainer: {
    flexDirection: "row", 
    justifyContent:"center", 
    alignItems: "center", 
    marginLeft: 5
  },
  statItem: {
    flexDirection: "row",
    justifyContent:"space-between", 
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 4,
    borderColor: theme.colors.primaryDark,
    width: "100%",
    paddingHorizontal: 10
  },  
  statText : {
    fontFamily: theme.regular,
    color: theme.colors.text,
    fontSize: 27,
  },
  progressBar: {
    borderRadius: 20,
    borderWidth: 5,
    borderColor: theme.colors.border,
    width: "100%",
    height: screenHeight*0.035,
    overflow: "hidden"
  },
  progressFill:{
    width: "50%",
    height: "100%",
    borderTopRightRadius: 20,
  },
  achievementsContainer :{
    flex: 1,
    width: screenWidth*0.9,
    alignSelf: "center",
    marginTop: "10%",
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  }
}); 