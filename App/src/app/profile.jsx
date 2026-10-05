import React, { memo, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

/* ============================================================
   ICON
============================================================ */

const Icon = memo(function Icon({
  name,
  size = 22,
  color = "#0F172A",
  library = "ion",
}) {
  if (library === "material") {
    return <MaterialCommunityIcons name={name} size={size} color={color} />;
  }

  return <Ionicons name={name} size={size} color={color} />;
});

/* ============================================================
   PROFILE CARD
============================================================ */

function ProfileCard({ dark, onEdit }) {
  return (
    <View style={[styles.profileCard, dark && styles.darkSurface]}>
      <View style={styles.profileTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>SK</Text>
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.profileIdentity}>
          <Text style={[styles.profileName, dark && styles.darkText]}>
            Shashi Kumar
          </Text>

          <Text style={[styles.profileEmail, dark && styles.darkMutedText]}>
            codewithshashi009@gmail.com
          </Text>

          <View style={styles.memberBadge}>
            <Icon name="shield-checkmark" size={13} color="#2563EB" />

            <Text style={styles.memberBadgeText}>Smart Route Member</Text>
          </View>
        </View>

        <Pressable style={styles.editButton} onPress={onEdit}>
          <Icon name="create-outline" size={18} color="#2563EB" />
        </Pressable>
      </View>

      <View style={styles.profileDivider} />

      <View style={styles.profileStats}>
        <ProfileStat icon="navigate" value="128" label="Trips" />

        <ProfileStat icon="map" value="2,486" label="KM Travelled" />

        <ProfileStat icon="leaf" value="18.4" label="KG CO₂ Saved" />
      </View>
    </View>
  );
}

function ProfileStat({ icon, value, label }) {
  return (
    <View style={styles.profileStat}>
      <View style={styles.profileStatIcon}>
        <Icon name={icon} size={17} color="#2563EB" />
      </View>

      <Text style={styles.profileStatValue}>{value}</Text>

      <Text style={styles.profileStatLabel}>{label}</Text>
    </View>
  );
}

/* ============================================================
   COMPLETE PROFILE CARD
============================================================ */

function CompleteProfileCard({ dark, percentage, onPress }) {
  return (
    <Pressable
      style={[styles.completeProfileCard, dark && styles.darkSurface]}
      onPress={onPress}
    >
      <View style={styles.completeProfileTop}>
        <View style={styles.completeProfileIcon}>
          <Icon name="person-circle-outline" size={25} color="#2563EB" />
        </View>

        <View style={styles.completeProfileContent}>
          <View style={styles.completeProfileTitleRow}>
            <Text
              style={[styles.completeProfileTitle, dark && styles.darkText]}
            >
              Complete Your Profile
            </Text>

            <Text style={styles.progressText}>{percentage}%</Text>
          </View>

          <Text
            style={[
              styles.completeProfileSubtitle,
              dark && styles.darkMutedText,
            ]}
          >
            Add your details for a safer journey experience.
          </Text>
        </View>

        <Icon name="chevron-forward" size={19} color="#94A3B8" />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>

      {percentage < 100 ? (
        <Text style={styles.completeHint}>
          Complete your profile to improve emergency assistance.
        </Text>
      ) : (
        <Text style={styles.completedHint}>Your profile is complete.</Text>
      )}
    </Pressable>
  );
}

/* ============================================================
   VEHICLE CARD
============================================================ */

function VehicleProfileCard({ dark, vehicle, onChange }) {
  return (
    <View style={[styles.sectionCard, dark && styles.darkSurface]}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, dark && styles.darkText]}>
            Travel Profile
          </Text>

          <Text style={[styles.sectionSubtitle, dark && styles.darkMutedText]}>
            Used for route recommendations
          </Text>
        </View>

        <View style={styles.sectionIcon}>
          <Icon name="analytics" size={18} color="#2563EB" />
        </View>
      </View>

      <View style={[styles.vehicleProfile, dark && styles.darkInnerSurface]}>
        <View style={styles.vehicleLargeIcon}>
          <Icon name={vehicleIcon(vehicle)} size={27} color="#2563EB" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.vehicleTitle, dark && styles.darkText]}>
            {vehicle}
          </Text>

          <Text style={[styles.vehicleSubtitle, dark && styles.darkMutedText]}>
            Route scoring is optimized for your vehicle type.
          </Text>
        </View>

        <Pressable style={styles.changeButton} onPress={onChange}>
          <Text style={styles.changeText}>Change</Text>
        </Pressable>
      </View>
    </View>
  );
}

function vehicleIcon(vehicle) {
  const icons = {
    Car: "car",
    Bike: "bicycle",
    Scooter: "bicycle",
    EV: "flash",
    Truck: "truck",
    Bicycle: "bicycle",
    Walking: "walk",
  };

  return icons[vehicle] || "car";
}

/* ============================================================
   SMART PREFERENCES
============================================================ */

function SmartPreferences({ dark, preferences, setPreferences }) {
  const update = (key, value) => {
    setPreferences((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  return (
    <View style={[styles.sectionCard, dark && styles.darkSurface]}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, dark && styles.darkText]}>
            Smart Preferences
          </Text>

          <Text style={[styles.sectionSubtitle, dark && styles.darkMutedText]}>
            Personalize route recommendations
          </Text>
        </View>

        <View style={styles.sectionIcon}>
          <Icon name="sparkles" size={18} color="#2563EB" />
        </View>
      </View>

      <PreferenceSwitch
        dark={dark}
        icon="shield-checkmark"
        title="Prioritize Safety"
        subtitle="Prefer safer roads over small time savings"
        value={preferences.safety}
        onChange={(value) => update("safety", value)}
      />

      <PreferenceSwitch
        dark={dark}
        icon="cash-outline"
        title="Avoid Toll Roads"
        subtitle="Reduce toll expenses where possible"
        value={preferences.tolls}
        onChange={(value) => update("tolls", value)}
      />

      <PreferenceSwitch
        dark={dark}
        icon="water"
        title="Avoid Flood Areas"
        subtitle="Avoid roads with higher waterlogging risk"
        value={preferences.flood}
        onChange={(value) => update("flood", value)}
      />

      <PreferenceSwitch
        dark={dark}
        icon="car"
        title="Avoid Heavy Traffic"
        subtitle="Prefer smoother traffic conditions"
        value={preferences.traffic}
        onChange={(value) => update("traffic", value)}
      />

      <PreferenceSwitch
        dark={dark}
        icon="leaf"
        title="Minimize CO₂"
        subtitle="Prefer routes with lower emissions"
        value={preferences.co2}
        onChange={(value) => update("co2", value)}
      />
    </View>
  );
}

function PreferenceSwitch({ dark, icon, title, subtitle, value, onChange }) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchIcon}>
        <Icon name={icon} size={18} color="#2563EB" />
      </View>

      <View style={styles.switchContent}>
        <Text style={[styles.switchTitle, dark && styles.darkText]}>
          {title}
        </Text>

        <Text style={[styles.switchSubtitle, dark && styles.darkMutedText]}>
          {subtitle}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          false: "#CBD5E1",
          true: "#93C5FD",
        }}
        thumbColor={value ? "#2563EB" : "#F8FAFC"}
      />
    </View>
  );
}

/* ============================================================
   SAVED PLACES
============================================================ */

function SavedPlaces({ dark, onPress }) {
  return (
    <View style={[styles.sectionCard, dark && styles.darkSurface]}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, dark && styles.darkText]}>
            Saved Places
          </Text>

          <Text style={[styles.sectionSubtitle, dark && styles.darkMutedText]}>
            Quickly navigate to your favorites
          </Text>
        </View>

        <Icon name="bookmark" size={20} color="#2563EB" />
      </View>

      <SavedPlace
        dark={dark}
        icon="home"
        title="Home"
        address="Add your home address"
        onPress={onPress}
      />

      <SavedPlace
        dark={dark}
        icon="briefcase"
        title="Work"
        address="Add your work address"
        onPress={onPress}
      />

      <SavedPlace
        dark={dark}
        icon="heart"
        title="Favorites"
        address="Manage favorite destinations"
        onPress={onPress}
      />
    </View>
  );
}

function SavedPlace({ dark, icon, title, address, onPress }) {
  return (
    <Pressable style={styles.savedPlaceRow} onPress={onPress}>
      <View style={styles.savedPlaceIcon}>
        <Icon name={icon} size={19} color="#2563EB" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.savedPlaceTitle, dark && styles.darkText]}>
          {title}
        </Text>

        <Text style={[styles.savedPlaceAddress, dark && styles.darkMutedText]}>
          {address}
        </Text>
      </View>

      <Icon name="chevron-forward" color="#94A3B8" size={18} />
    </Pressable>
  );
}

/* ============================================================
   ACCOUNT
============================================================ */

function AccountSection({ dark, onEditProfile, onNotifications, onPrivacy }) {
  return (
    <>
      <View style={styles.sectionHeading}>
        <Text style={[styles.headingTitle, dark && styles.darkText]}>
          Account
        </Text>

        <Text style={[styles.headingSubtitle, dark && styles.darkMutedText]}>
          Manage your Smart Route account
        </Text>
      </View>

      <View style={styles.accountList}>
        <PreferenceCard
          dark={dark}
          icon="person-outline"
          title="Personal Information"
          subtitle="Name, email and profile details"
          onPress={onEditProfile}
        />

        <PreferenceCard
          dark={dark}
          icon="notifications-outline"
          title="Notifications"
          subtitle="Traffic, weather and route alerts"
          onPress={onNotifications}
        />

        <PreferenceCard
          dark={dark}
          icon="lock-closed-outline"
          title="Privacy & Security"
          subtitle="Control your account privacy"
          onPress={onPrivacy}
        />

        <PreferenceCard
          dark={dark}
          icon="language-outline"
          title="Language"
          subtitle="English"
          onPress={() => Alert.alert("Language", "Language selection opened.")}
        />

        <PreferenceCard
          dark={dark}
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="Get help with Smart Route"
          onPress={() =>
            Alert.alert("Help & Support", "Support center opened.")
          }
        />
      </View>
    </>
  );
}

function PreferenceCard({ dark, icon, title, subtitle, onPress }) {
  return (
    <Pressable
      style={[styles.preferenceCard, dark && styles.darkSurface]}
      onPress={onPress}
    >
      <View style={styles.preferenceIcon}>
        <Icon name={icon} size={20} color="#2563EB" />
      </View>

      <View style={styles.preferenceContent}>
        <Text style={[styles.preferenceTitle, dark && styles.darkText]}>
          {title}
        </Text>

        <Text style={[styles.preferenceSubtitle, dark && styles.darkMutedText]}>
          {subtitle}
        </Text>
      </View>

      <Icon name="chevron-forward" size={19} color="#94A3B8" />
    </Pressable>
  );
}

/* ============================================================
   EMERGENCY CONTACTS
============================================================ */

function EmergencyContacts({ dark, contacts, onAdd, onEdit, onDelete }) {
  return (
    <View style={[styles.sectionCard, dark && styles.darkSurface]}>
      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionTitle, dark && styles.darkText]}>
            Emergency Contacts
          </Text>

          <Text style={[styles.sectionSubtitle, dark && styles.darkMutedText]}>
            Add up to 4 people for emergency help
          </Text>
        </View>

        <View style={styles.emergencyHeaderIcon}>
          <Icon name="call" size={18} color="#DC2626" />
        </View>
      </View>

      {contacts.length === 0 ? (
        <View style={[styles.emptyEmergency, dark && styles.darkInnerSurface]}>
          <View style={styles.emptyEmergencyIcon}>
            <Icon name="people-outline" size={24} color="#2563EB" />
          </View>

          <Text style={[styles.emptyEmergencyTitle, dark && styles.darkText]}>
            No emergency contact added
          </Text>

          <Text
            style={[
              styles.emptyEmergencySubtitle,
              dark && styles.darkMutedText,
            ]}
          >
            Add trusted people who can be contacted during an emergency.
          </Text>
        </View>
      ) : (
        contacts.map((contact, index) => (
          <EmergencyContactRow
            key={contact.id}
            dark={dark}
            contact={contact}
            index={index}
            onEdit={() => onEdit(contact)}
            onDelete={() => onDelete(contact.id)}
          />
        ))
      )}

      {contacts.length < 4 && (
        <Pressable style={styles.addEmergencyButton} onPress={onAdd}>
          <Icon name="add" size={20} color="#2563EB" />

          <Text style={styles.addEmergencyText}>Add Emergency Contact</Text>
        </Pressable>
      )}

      <Text style={[styles.contactCount, dark && styles.darkMutedText]}>
        {contacts.length}/4 contacts added
      </Text>
    </View>
  );
}

function EmergencyContactRow({ dark, contact, index, onEdit, onDelete }) {
  return (
    <View style={[styles.emergencyContactRow, dark && styles.darkInnerSurface]}>
      <View style={styles.emergencyAvatar}>
        <Text style={styles.emergencyAvatarText}>
          {getInitials(contact.name)}
        </Text>
      </View>

      <View style={styles.emergencyContactInfo}>
        <View style={styles.contactNameRow}>
          <Text style={[styles.emergencyContactName, dark && styles.darkText]}>
            {contact.name}
          </Text>

          <View style={styles.relationBadge}>
            <Text style={styles.relationText}>
              {contact.relation || "Contact"}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.emergencyContactPhone, dark && styles.darkMutedText]}
        >
          {contact.phone}
        </Text>

        <Text style={styles.contactNumber}>Emergency Contact {index + 1}</Text>
      </View>

      <View style={styles.contactActions}>
        <Pressable style={styles.smallActionButton} onPress={onEdit}>
          <Icon name="create-outline" size={17} color="#2563EB" />
        </Pressable>

        <Pressable
          style={[styles.smallActionButton, styles.deleteActionButton]}
          onPress={onDelete}
        >
          <Icon name="trash-outline" size={17} color="#DC2626" />
        </Pressable>
      </View>
    </View>
  );
}

function getInitials(name) {
  if (!name) return "?";

  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ============================================================
   ABOUT
============================================================ */

function AboutCard({ dark }) {
  return (
    <View style={[styles.aboutCard, dark && styles.darkSurface]}>
      <View style={styles.aboutIcon}>
        <Icon name="sparkles" size={20} color="#2563EB" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.aboutTitle, dark && styles.darkText]}>
          Smart Route
        </Text>

        <Text style={[styles.aboutText, dark && styles.darkMutedText]}>
          Intelligent route recommendations based on safety, traffic, weather
          and road conditions.
        </Text>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

/* ============================================================
   COMPLETE PROFILE MODAL
============================================================ */

function CompleteProfileModal({ visible, dark, profile, onSave, onClose }) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [dob, setDob] = useState(profile.dob);
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup);
  const [address, setAddress] = useState(profile.address);

  React.useEffect(() => {
    if (visible) {
      setName(profile.name);
      setEmail(profile.email);
      setPhone(profile.phone);
      setDob(profile.dob);
      setBloodGroup(profile.bloodGroup);
      setAddress(profile.address);
    }
  }, [visible, profile]);

  const save = () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Phone required", "Please enter your phone number.");
      return;
    }

    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dob: dob.trim(),
      bloodGroup: bloodGroup.trim(),
      address: address.trim(),
    });

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.largeEditSheet, dark && styles.darkSurface]}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, dark && styles.darkText]}>
                Complete Profile
              </Text>

              <Text
                style={[styles.sheetSubtitle, dark && styles.darkMutedText]}
              >
                Keep your information updated
              </Text>
            </View>

            <Pressable onPress={onClose}>
              <Icon
                name="close"
                size={24}
                color={dark ? "#F8FAFC" : "#0F172A"}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ProfileInput
              dark={dark}
              label="FULL NAME"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
            />

            <ProfileInput
              dark={dark}
              label="EMAIL"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
            />

            <ProfileInput
              dark={dark}
              label="PHONE NUMBER"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <ProfileInput
              dark={dark}
              label="DATE OF BIRTH"
              icon="calendar-outline"
              value={dob}
              onChangeText={setDob}
              placeholder="DD/MM/YYYY"
            />

            <ProfileInput
              dark={dark}
              label="BLOOD GROUP"
              icon="water-outline"
              value={bloodGroup}
              onChangeText={setBloodGroup}
              placeholder="Example: O+"
            />

            <ProfileInput
              dark={dark}
              label="ADDRESS"
              icon="location-outline"
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address"
              multiline
            />

            <Pressable style={styles.saveButton} onPress={save}>
              <Icon name="checkmark" color="#FFFFFF" size={20} />

              <Text style={styles.saveButtonText}>Save Profile</Text>
            </Pressable>

            <View style={{ height: 25 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ProfileInput({
  dark,
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline = false,
}) {
  return (
    <View>
      <Text style={[styles.inputLabel, dark && styles.darkMutedText]}>
        {label}
      </Text>

      <View
        style={[
          styles.inputBox,
          multiline && styles.multilineInputBox,
          dark && styles.darkInput,
        ]}
      >
        <Icon name={icon} color="#64748B" size={19} />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            dark && styles.darkText,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
        />
      </View>
    </View>
  );
}

/* ============================================================
   EMERGENCY CONTACT MODAL
============================================================ */

function EmergencyContactModal({ visible, dark, contact, onSave, onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("");

  React.useEffect(() => {
    if (visible) {
      setName(contact?.name || "");
      setPhone(contact?.phone || "");
      setRelation(contact?.relation || "");
    }
  }, [visible, contact]);

  const save = () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter emergency contact name.");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Phone required", "Please enter emergency contact number.");
      return;
    }

    onSave({
      id: contact?.id || Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      relation: relation.trim() || "Contact",
    });

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.editSheet, dark && styles.darkSurface]}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, dark && styles.darkText]}>
                {contact ? "Edit Contact" : "Add Emergency Contact"}
              </Text>

              <Text
                style={[styles.sheetSubtitle, dark && styles.darkMutedText]}
              >
                This person can help during an emergency.
              </Text>
            </View>

            <Pressable onPress={onClose}>
              <Icon
                name="close"
                size={24}
                color={dark ? "#F8FAFC" : "#0F172A"}
              />
            </Pressable>
          </View>

          <ProfileInput
            dark={dark}
            label="CONTACT NAME"
            icon="person-outline"
            value={name}
            onChangeText={setName}
            placeholder="Example: Rahul Kumar"
          />

          <ProfileInput
            dark={dark}
            label="PHONE NUMBER"
            icon="call-outline"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          <ProfileInput
            dark={dark}
            label="RELATION"
            icon="people-outline"
            value={relation}
            onChangeText={setRelation}
            placeholder="Example: Brother, Father, Friend"
          />

          <Pressable style={styles.saveButton} onPress={save}>
            <Icon name="checkmark" color="#FFFFFF" size={20} />

            <Text style={styles.saveButtonText}>
              {contact ? "Update Contact" : "Save Contact"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================
   MAIN PROFILE SCREEN
============================================================ */

export default function ProfileScreen() {
  const navigation = useNavigation();
  const systemTheme = useColorScheme();

  const [dark, setDark] = useState(systemTheme === "dark");

  const [completeProfileModal, setCompleteProfileModal] = useState(false);

  const [contactModal, setContactModal] = useState(false);

  const [editingContact, setEditingContact] = useState(null);

  const [vehicle, setVehicle] = useState("Car");

  const [preferences, setPreferences] = useState({
    safety: true,
    tolls: true,
    flood: true,
    traffic: false,
    co2: false,
  });

  const [profile, setProfile] = useState({
    name: "Shashi Kumar",
    email: "codewithshashi009@gmail.com",
    phone: "",
    dob: "",
    bloodGroup: "",
    address: "",
  });

  const [emergencyContacts, setEmergencyContacts] = useState([]);

  /* ==========================================================
     PROFILE COMPLETION
  ========================================================== */

  const profilePercentage = useMemo(() => {
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.dob,
      profile.bloodGroup,
      profile.address,
    ];

    const completed = fields.filter((item) => item && item.trim()).length;

    return Math.round((completed / fields.length) * 100);
  }, [profile]);

  /* ==========================================================
     PROFILE SAVE
  ========================================================== */

  const handleSaveProfile = (updatedProfile) => {
    setProfile(updatedProfile);

    Alert.alert("Profile updated", "Your profile information has been saved.");
  };

  /* ==========================================================
     EMERGENCY CONTACT
  ========================================================== */

  const openAddContact = () => {
    if (emergencyContacts.length >= 4) {
      Alert.alert(
        "Maximum contacts reached",
        "You can add maximum 4 emergency contacts.",
      );
      return;
    }

    setEditingContact(null);
    setContactModal(true);
  };

  const openEditContact = (contact) => {
    setEditingContact(contact);
    setContactModal(true);
  };

  const saveEmergencyContact = (contact) => {
    setEmergencyContacts((previous) => {
      const exists = previous.some((item) => item.id === contact.id);

      if (exists) {
        return previous.map((item) =>
          item.id === contact.id ? contact : item,
        );
      }

      return [...previous, contact];
    });

    Alert.alert(
      "Contact saved",
      "Emergency contact has been saved successfully.",
    );
  };

  const deleteEmergencyContact = (id) => {
    Alert.alert(
      "Remove contact",
      "Are you sure you want to remove this emergency contact?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setEmergencyContacts((previous) =>
              previous.filter((item) => item.id !== id),
            );
          },
        },
      ],
    );
  };

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          /*
           * Reset navigation stack so user cannot
           * press back and return to Profile.
           *
           * IMPORTANT:
           * "Login" must match your navigator's
           * login screen name.
           */

          navigation.reset({
            index: 0,
            routes: [
              {
                name: "login",
              },
            ],
          });
        },
      },
    ]);
  };

  /* ==========================================================
     VEHICLE
  ========================================================== */

  const changeVehicle = () => {
    const vehicles = [
      "Car",
      "Bike",
      "Scooter",
      "EV",
      "Truck",
      "Bicycle",
      "Walking",
    ];

    const currentIndex = vehicles.indexOf(vehicle);

    const nextVehicle = vehicles[(currentIndex + 1) % vehicles.length];

    setVehicle(nextVehicle);
  };

  /* ==========================================================
     COMING SOON
  ========================================================== */

  const showComingSoon = (title) => {
    Alert.alert(title, `${title} settings opened.`);
  };

  return (
    <SafeAreaView style={[styles.container, dark && styles.darkBackground]}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ====================================================
            PROFILE
        ==================================================== */}

        <ProfileCard dark={dark} onEdit={() => setCompleteProfileModal(true)} />

        {/* ====================================================
            COMPLETE PROFILE
        ==================================================== */}

        <CompleteProfileCard
          dark={dark}
          percentage={profilePercentage}
          onPress={() => setCompleteProfileModal(true)}
        />

        {/* ====================================================
            DRIVING PROFILE
        ==================================================== */}

        <View style={styles.sectionHeading}>
          <Text style={[styles.headingTitle, dark && styles.darkText]}>
            Your Driving Profile
          </Text>

          <Text style={[styles.headingSubtitle, dark && styles.darkMutedText]}>
            Personalized route intelligence
          </Text>
        </View>

        <VehicleProfileCard
          dark={dark}
          vehicle={vehicle}
          onChange={changeVehicle}
        />

        {/* ====================================================
            SMART PREFERENCES
        ==================================================== */}

        <SmartPreferences
          dark={dark}
          preferences={preferences}
          setPreferences={setPreferences}
        />

        {/* ====================================================
            EMERGENCY CONTACTS
        ==================================================== */}

        <View style={styles.sectionHeading}>
          <Text style={[styles.headingTitle, dark && styles.darkText]}>
            Safety
          </Text>

          <Text style={[styles.headingSubtitle, dark && styles.darkMutedText]}>
            Keep trusted people ready for emergencies
          </Text>
        </View>

        <EmergencyContacts
          dark={dark}
          contacts={emergencyContacts}
          onAdd={openAddContact}
          onEdit={openEditContact}
          onDelete={deleteEmergencyContact}
        />

        {/* ====================================================
            SAVED PLACES
        ==================================================== */}

        <SavedPlaces
          dark={dark}
          onPress={() => showComingSoon("Saved Places")}
        />

        {/* ====================================================
            ACCOUNT
        ==================================================== */}

        <AccountSection
          dark={dark}
          onEditProfile={() => setCompleteProfileModal(true)}
          onNotifications={() => showComingSoon("Notifications")}
          onPrivacy={() => showComingSoon("Privacy & Security")}
        />

        {/* ====================================================
            ABOUT
        ==================================================== */}

        <AboutCard dark={dark} />

        {/* ====================================================
            LOGOUT
        ==================================================== */}

        <Pressable
          style={[styles.logoutButton, dark && styles.darkLogoutButton]}
          onPress={handleLogout}
        >
          <Icon name="log-out-outline" color="#DC2626" size={20} />

          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <Text style={[styles.footerText, dark && styles.darkMutedText]}>
          Smart Route • Made for safer journeys
        </Text>

        <View style={{ height: 35 }} />
      </ScrollView>

      {/* ======================================================
          COMPLETE PROFILE MODAL
      ====================================================== */}

      <CompleteProfileModal
        visible={completeProfileModal}
        dark={dark}
        profile={profile}
        onSave={handleSaveProfile}
        onClose={() => setCompleteProfileModal(false)}
      />

      {/* ======================================================
          EMERGENCY CONTACT MODAL
      ====================================================== */}

      <EmergencyContactModal
        visible={contactModal}
        dark={dark}
        contact={editingContact}
        onSave={saveEmergencyContact}
        onClose={() => {
          setContactModal(false);
          setEditingContact(null);
        }}
      />
    </SafeAreaView>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  /* ==========================================================
     GLOBAL
  ========================================================== */

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  darkBackground: {
    backgroundColor: "#0F172A",
  },

  darkSurface: {
    backgroundColor: "#111827",
  },

  darkInnerSurface: {
    backgroundColor: "#1E293B",
  },

  darkText: {
    color: "#F8FAFC",
  },

  darkMutedText: {
    color: "#94A3B8",
  },

  scrollContent: {
    paddingTop: 12,
    paddingBottom: 20,
  },

  /* ==========================================================
     PROFILE
  ========================================================== */

  profileCard: {
    marginHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },

  profileTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  onlineDot: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#16A34A",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    right: 0,
    bottom: 2,
  },

  profileIdentity: {
    flex: 1,
    marginLeft: 13,
  },

  profileName: {
    color: "#0F172A",
    fontSize: 19,
    fontWeight: "900",
  },

  profileEmail: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 3,
  },

  memberBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  memberBadgeText: {
    color: "#2563EB",
    fontSize: 9,
    fontWeight: "900",
    marginLeft: 4,
  },

  editButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  profileDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginTop: 18,
    marginBottom: 15,
  },

  profileStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  profileStat: {
    flex: 1,
    alignItems: "center",
  },

  profileStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  profileStatValue: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 7,
  },

  profileStatLabel: {
    color: "#64748B",
    fontSize: 8,
    fontWeight: "700",
    marginTop: 2,
  },

  /* ==========================================================
     COMPLETE PROFILE
  ========================================================== */

  completeProfileCard: {
    marginHorizontal: 14,
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  completeProfileTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  completeProfileIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  completeProfileContent: {
    flex: 1,
  },

  completeProfileTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  completeProfileTitle: {
    flex: 1,
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "900",
  },

  completeProfileSubtitle: {
    color: "#64748B",
    fontSize: 9,
    marginTop: 4,
    lineHeight: 13,
  },

  progressText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 8,
  },

  progressTrack: {
    height: 7,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    marginTop: 13,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 10,
  },

  completeHint: {
    color: "#2563EB",
    fontSize: 8,
    fontWeight: "700",
    marginTop: 7,
  },

  completedHint: {
    color: "#16A34A",
    fontSize: 8,
    fontWeight: "800",
    marginTop: 7,
  },

  /* ==========================================================
     HEADINGS
  ========================================================== */

  sectionHeading: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 9,
  },

  headingTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },

  headingSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
  },

  /* ==========================================================
     SECTION
  ========================================================== */

  sectionCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 14,
    marginTop: 3,
    borderRadius: 20,
    padding: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 3,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ==========================================================
     VEHICLE
  ========================================================== */

  vehicleProfile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 15,
    padding: 12,
  },

  vehicleLargeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  vehicleTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0F172A",
  },

  vehicleSubtitle: {
    fontSize: 9,
    lineHeight: 14,
    color: "#64748B",
    marginTop: 3,
  },

  changeButton: {
    minHeight: 40,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
  },

  changeText: {
    color: "#2563EB",
    fontSize: 10,
    fontWeight: "900",
  },

  /* ==========================================================
     SMART PREFERENCES
  ========================================================== */

  switchRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  switchIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  switchContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },

  switchTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },

  switchSubtitle: {
    fontSize: 9,
    lineHeight: 13,
    color: "#64748B",
    marginTop: 2,
  },

  /* ==========================================================
     EMERGENCY CONTACTS
  ========================================================== */

  emergencyHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyEmergency: {
    backgroundColor: "#F8FAFC",
    borderRadius: 15,
    padding: 17,
    alignItems: "center",
  },

  emptyEmergencyIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyEmergencyTitle: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 9,
  },

  emptyEmergencySubtitle: {
    color: "#64748B",
    fontSize: 9,
    textAlign: "center",
    lineHeight: 14,
    marginTop: 4,
  },

  emergencyContactRow: {
    minHeight: 76,
    backgroundColor: "#F8FAFC",
    borderRadius: 15,
    padding: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  emergencyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  emergencyAvatarText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  emergencyContactInfo: {
    flex: 1,
  },

  contactNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  emergencyContactName: {
    color: "#0F172A",
    fontSize: 11,
    fontWeight: "900",
    maxWidth: "60%",
  },

  relationBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 6,
  },

  relationText: {
    color: "#2563EB",
    fontSize: 7,
    fontWeight: "900",
  },

  emergencyContactPhone: {
    color: "#64748B",
    fontSize: 9,
    marginTop: 4,
  },

  contactNumber: {
    color: "#94A3B8",
    fontSize: 7,
    marginTop: 3,
  },

  contactActions: {
    flexDirection: "row",
    marginLeft: 6,
  },

  smallActionButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },

  deleteActionButton: {
    backgroundColor: "#FEF2F2",
  },

  addEmergencyButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderStyle: "dashed",
    backgroundColor: "#F8FBFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 5,
  },

  addEmergencyText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 6,
  },

  contactCount: {
    color: "#64748B",
    fontSize: 8,
    textAlign: "center",
    marginTop: 9,
  },

  /* ==========================================================
     SAVED PLACES
  ========================================================== */

  savedPlaceRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  savedPlaceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  savedPlaceTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },

  savedPlaceAddress: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 3,
  },

  /* ==========================================================
     ACCOUNT
  ========================================================== */

  accountList: {
    marginHorizontal: 14,
  },

  preferenceCard: {
    minHeight: 68,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 13,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  preferenceContent: {
    flex: 1,
  },

  preferenceTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },

  preferenceSubtitle: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 3,
  },

  /* ==========================================================
     ABOUT
  ========================================================== */

  aboutCard: {
    marginHorizontal: 14,
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
  },

  aboutIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  aboutTitle: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "900",
  },

  aboutText: {
    color: "#64748B",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  versionText: {
    color: "#2563EB",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 7,
  },

  /* ==========================================================
     LOGOUT
  ========================================================== */

  logoutButton: {
    marginHorizontal: 14,
    marginTop: 14,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  darkLogoutButton: {
    backgroundColor: "#1F2937",
    borderColor: "#7F1D1D",
  },

  logoutText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 7,
  },

  footerText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 9,
    marginTop: 16,
  },

  /* ==========================================================
     MODAL
  ========================================================== */

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.5)",
  },

  editSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 18,
    maxHeight: "88%",
  },

  largeEditSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 18,
    maxHeight: "92%",
  },

  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 13,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sheetTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },

  sheetSubtitle: {
    color: "#64748B",
    fontSize: 9,
    marginTop: 3,
  },

  inputLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#64748B",
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 7,
  },

  inputBox: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  multilineInputBox: {
    minHeight: 90,
    alignItems: "flex-start",
    paddingTop: 14,
  },

  darkInput: {
    backgroundColor: "#1E293B",
  },

  input: {
    flex: 1,
    height: "100%",
    marginLeft: 9,
    color: "#0F172A",
    fontSize: 13,
  },

  multilineInput: {
    minHeight: 65,
  },

  saveButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 22,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 7,
  },
});
