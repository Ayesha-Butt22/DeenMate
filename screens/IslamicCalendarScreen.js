import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  Alert,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
} from "react-native";
import moment from "moment-hijri";
import * as Notifications from "expo-notifications";
import { LinearGradient } from "expo-linear-gradient";
import {
  MaterialIcons,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;

// Color palette
const colors = {
  primaryGreen: "#2E7D32",
  lightGreen: "#E8F5E9",
  accentGold: "#FFD700",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#666666",
  lightGray: "#F5F5F5",
  darkGreen: "#1B5E20",
};

// Helper function to darken a hex color
function darkenColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

const islamicEvents = [
  {
    date: "1446-09-01",
    title: "Start of Ramadan",
    icon: "mosque",
    iconLib: FontAwesome5,
    color: "#4A6FA5",
    description: "The holy month of fasting begins. Muslims worldwide observe fasting from dawn to sunset, engage in increased prayer and recitation of the Quran, and practice charity and self-discipline.",
  },
  {
    date: "1446-10-01",
    title: "Eid al-Fitr",
    icon: "holiday-village",
    iconLib: MaterialIcons,
    color: "#FFD700",
    description: "Festival of Breaking the Fast marks the end of Ramadan. It's a day of celebration with special prayers, feasting, wearing new clothes, giving charity (Zakat al-Fitr), and visiting family and friends.",
  },
  {
    date: "1446-12-09",
    title: "Day of Arafah",
    icon: "landscape",
    iconLib: MaterialIcons,
    color: "#5E8C31",
    description: "The most important day of Hajj when pilgrims gather at the plain of Arafah. For non-pilgrims, it's a day of fasting and seeking forgiveness. The Prophet Muhammad said the sins of two years are forgiven for those who fast on this day.",
  },
  {
    date: "1446-12-10",
    title: "Eid al-Adha",
    icon: "festival",
    iconLib: MaterialCommunityIcons,
    color: "#C14543",
    description: "Festival of Sacrifice commemorates Prophet Ibrahim's willingness to sacrifice his son Ismail. Muslims perform Qurbani (sacrifice of an animal), distribute the meat to the poor, and celebrate with prayers and gatherings.",
  },
  {
    date: "1446-01-10",
    title: "Ashura",
    icon: "water",
    iconLib: FontAwesome5,
    color: "#8E44AD",
    description: "Commemorates the day Allah saved Musa (Moses) and the Israelites from Pharaoh. Fasting on this day is recommended (either the 9th and 10th or 10th and 11th of Muharram). For Shia Muslims, it also marks the martyrdom of Imam Hussain.",
  },
  {
    date: "1446-08-15",
    title: "Laylat al-Qadr",
    icon: "star",
    iconLib: AntDesign,
    color: "#9C27B0",
    description: "The Night of Power, better than a thousand months. Angels descend with blessings, and prayers are especially rewarded. Muslims seek this night in the last ten odd nights of Ramadan through intense worship, prayer, and Quran recitation.",
  },
];

export default function IslamicCalendarScreen() {
  const [today] = useState(moment());
  const [hijriDate] = useState(moment().format("iYYYY-iMM-iDD"));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    scheduleEventReminders();
  }, []);

  const scheduleEventReminders = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required", 
        "Please enable notifications to get reminders for Islamic events.",
        [{ text: "OK" }]
      );
      return;
    }

    islamicEvents.forEach((event) => {
      const eventMoment = moment(event.date, "iYYYY-iMM-iDD");
      const notifyTime = eventMoment.subtract(1, "days").toDate();
      if (notifyTime > new Date()) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: `📅 ${event.title}`,
            body: event.description.substring(0, 100) + "...",
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: notifyTime,
        });
      }
    });
  };

  const handleEventPress = (item) => {
    setSelectedEvent(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => {
    const isToday = hijriDate === item.date;
    const daysUntil = moment(item.date, "iYYYY-iMM-iDD").diff(moment(), "days");
    const IconComponent = item.iconLib || MaterialIcons;
    const isPastEvent = daysUntil < 0;

    return (
      <TouchableOpacity 
        onPress={() => handleEventPress(item)} 
        activeOpacity={0.7}
        style={styles.eventCardShadow}
      >
        <LinearGradient
          colors={[
            item.color, 
            darkenColor(item.color, isPastEvent ? 40 : 20)
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.eventCard, 
            isToday && styles.highlight,
            isPastEvent && styles.pastEvent
          ]}
        >
          <View style={styles.eventIconContainer}>
            <IconComponent name={item.icon} size={isSmallDevice ? 20 : 24} color="white" />
          </View>
          <View style={styles.eventTextContainer}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDate}>
              {moment(item.date, "iYYYY-iMM-iDD").format("iD iMMMM iYYYY")}
            </Text>
            {!isPastEvent ? (
              <Text style={styles.daysRemaining}>
                {daysUntil} day{daysUntil !== 1 ? "s" : ""} remaining
              </Text>
            ) : (
              <Text style={styles.pastEventText}>
                Occurred {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? "s" : ""} ago
              </Text>
            )}
          </View>
          <MaterialIcons 
            name="chevron-right" 
            size={24} 
            color="rgba(255,255,255,0.7)" 
          />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.darkGreen} barStyle="light-content" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.darkGreen, colors.primaryGreen]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Islamic Calendar</Text>
            <Text style={styles.dateText}>{today.format("dddd, MMMM Do YYYY")}</Text>
            <Text style={styles.hijriText}>
              {moment().format("iD iMMMM iYYYY")} AH
            </Text>
          </View>
          <FontAwesome5 
            name="calendar-alt" 
            size={isSmallDevice ? 40 : 50} 
            color="rgba(255,255,255,0.2)" 
            style={styles.headerIcon}
          />
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Islamic Events</Text>
            <Text style={styles.sectionSubtitle}>
              Important dates in the Hijri calendar
            </Text>
          </View>

          <FlatList
            data={islamicEvents.sort((a, b) => 
              moment(a.date, "iYYYY-iMM-iDD").diff(moment(b.date, "iYYYY-iMM-iDD"))
            )}
            renderItem={renderItem}
            keyExtractor={(item) => item.date}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      </ScrollView>

      {/* Event Detail Modal */}
      <Modal 
        visible={modalVisible} 
        transparent 
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[
                selectedEvent?.color || colors.primaryGreen,
                darkenColor(selectedEvent?.color || colors.primaryGreen, 30),
              ]}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.modalIconContainer}>
                {selectedEvent?.iconLib && (
                  <selectedEvent.iconLib 
                    name={selectedEvent?.icon} 
                    size={32} 
                    color="white" 
                  />
                )}
              </View>
              <Text style={styles.modalTitle}>{selectedEvent?.title}</Text>
            </LinearGradient>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDate}>
                {selectedEvent && moment(selectedEvent.date, "iYYYY-iMM-iDD").format("dddd, iD iMMMM iYYYY")}
              </Text>
              <View style={styles.divider} />
              <Text style={styles.modalDescription}>
                {selectedEvent?.description}
              </Text>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)} 
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.lightGreen,
  },
  container: {
    flex: 1,
    backgroundColor: colors.lightGreen,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 20,
    paddingBottom: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    zIndex: 1,
  },
  headerIcon: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    opacity: 0.5,
  },
  headerTitle: {
    color: colors.white,
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  dateText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: isSmallDevice ? 14 : 16,
    marginBottom: 3,
  },
  hijriText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: isSmallDevice ? 14 : 16,
    fontStyle: "italic",
  },
  content: {
    paddingHorizontal: 16,
    marginTop: -20,
  },
  sectionHeader: {
    marginBottom: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 20 : 22,
    fontWeight: "bold",
    color: colors.black,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 5,
  },
  listContainer: {
    paddingBottom: 20,
  },
  eventCardShadow: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: isSmallDevice ? 14 : 18,
    alignItems: "center",
  },
  highlight: {
    borderWidth: 2,
    borderColor: colors.accentGold,
  },
  pastEvent: {
    opacity: 0.9,
  },
  eventIconContainer: {
    marginRight: 16,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 30,
    width: 40,
    height: 40,
    alignItems: "center",
  },
  eventTextContainer: {
    flex: 1,
  },
  eventTitle: {
    color: colors.white,
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: "bold",
  },
  eventDate: {
    color: "rgba(255,255,255,0.9)",
    fontSize: isSmallDevice ? 12 : 14,
    marginTop: 4,
  },
  daysRemaining: {
    color: colors.accentGold,
    fontSize: isSmallDevice ? 12 : 13,
    marginTop: 6,
    fontWeight: "500",
  },
  pastEventText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: isSmallDevice ? 12 : 13,
    marginTop: 6,
    fontStyle: "italic",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    maxHeight: height * 0.85,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
  },
  modalIconContainer: {
    position: 'absolute',
    left: 25,
    top: 25,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: isSmallDevice ? 22 : 24,
    color: colors.white,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  modalBody: {
    padding: 25,
    paddingTop: 20,
  },
  modalDate: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: colors.gray,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 15,
  },
  modalDescription: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 24,
    color: colors.black,
    textAlign: "left",
  },
  modalFooter: {
    marginTop: 25,
  },
  closeButton: {
    backgroundColor: colors.primaryGreen,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});