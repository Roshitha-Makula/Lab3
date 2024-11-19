import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, TextInput, View,
  FlatList, TouchableOpacity, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current; // For delete animation

  // Retrieve tasks from AsyncStorage on app load
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever tasks state changes
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    };
    saveTasks();
  }, [tasks]);

  // Add a new task
  const addTask = () => {
    if (task.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), text: task, completed: false }]);
      setTask('');
    }
  };

  // Delete a task with fade-out animation
  const deleteTask = (taskId) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTasks(tasks.filter((item) => item.id !== taskId));
      fadeAnim.setValue(1); // Reset animation for future deletions
    });
  };

  // Toggle task completion
  const toggleComplete = (taskId) => {
    setTasks(
      tasks.map((item) =>
        item.id === taskId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Enable task editing with background color change
  const startEditingTask = (taskId, currentText) => {
    setEditingTaskId(taskId);
    setEditingTaskText(currentText);
  };

  // Update task after editing
  const updateTask = () => {
    if (editingTaskText.trim()) {
      setTasks(
        tasks.map((item) =>
          item.id === editingTaskId ? { ...item, text: editingTaskText } : item
        )
      );
      cancelEditing(); // Reset editing state
    }
  };

  // Cancel task editing
  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTaskText('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <Animated.View
            style={[
              styles.taskContainer,
              { opacity: fadeAnim },
              editingTaskId === item.id && styles.editingBackground, // Highlight background if editing
            ]}
          >
            {editingTaskId === item.id ? (
              // Editing mode
              <View style={styles.editingContainer}>
                <TextInput
                  style={styles.editInput}
                  value={editingTaskText}
                  onChangeText={(text) => setEditingTaskText(text)}
                />
                <TouchableOpacity onPress={updateTask}>
                  <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={cancelEditing}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Normal mode
              <>
                <TouchableOpacity
                  onPress={() => toggleComplete(item.id)}
                  style={{ flex: 1 }}
                >
                  <Text
                    style={[
                      styles.taskText,
                      item.completed && styles.completedTaskText,
                    ]}
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => startEditingTask(item.id, item.text)}
                >
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(item.id)}>
                  <Text style={styles.deleteButton}>X</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    marginVertical: 5,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  editButton: {
    color: '#5C5CFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 10,
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 18,
  },
  editingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  editingBackground: {
    backgroundColor: '#f0f8ff',
  },
  editInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  saveButton: {
    color: '#5C5CFF',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  cancelButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
