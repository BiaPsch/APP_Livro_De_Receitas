import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  TouchableWithoutFeedback,
  Keyboard, // Importando a API Keyboard
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    ingredients: "",
    time: "",
  });
  const [editingIndex, setEditingIndex] = useState(null); // Para saber qual receita estamos editando

  useEffect(() => {
    const loadRecipes = async () => {
      const storedRecipes = await AsyncStorage.getItem("recipes");
      if (storedRecipes) {
        setRecipes(JSON.parse(storedRecipes));
      }
    };
    loadRecipes();
  }, []);

  useEffect(() => {
    const saveRecipes = async () => {
      await AsyncStorage.setItem("recipes", JSON.stringify(recipes));
    };
    saveRecipes();
  }, [recipes]);

  const handleAddRecipe = () => {
    if (!newRecipe.title || !newRecipe.ingredients || !newRecipe.time) {
      Alert.alert("Erro", "Por favor, preencha todos os campos!");
      return;
    }

    const recipe = {
      title: newRecipe.title,
      ingredients: newRecipe.ingredients.split(",").map((item) => item.trim()),
      time: `${newRecipe.time} MIN`,
    };

    if (editingIndex !== null) {
      // Editando uma receita existente
      const updatedRecipes = [...recipes];
      updatedRecipes[editingIndex] = recipe;
      setRecipes(updatedRecipes);
    } else {
      // Adicionando nova receita
      setRecipes([...recipes, recipe]);
    }

    setNewRecipe({ title: "", ingredients: "", time: "" });
    setEditingIndex(null); // Reseta a edição
    setModalVisible(false);
  };

  const handleDeleteRecipe = (index) => {
    Alert.alert(
      "Apagar Receita",
      "Tem certeza que deseja apagar esta receita?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Apagar",
          style: "destructive",
          onPress: () => {
            const updatedRecipes = recipes.filter((_, i) => i !== index);
            setRecipes(updatedRecipes);
          },
        },
      ]
    );
  };

  const handleEditRecipe = (index) => {
    const recipeToEdit = recipes[index];
    setNewRecipe({
      title: recipeToEdit.title,
      ingredients: recipeToEdit.ingredients.join(", "),
      time: recipeToEdit.time.replace(" MIN", ""),
    });
    setEditingIndex(index); // Define qual receita será editada
    setModalVisible(true); // Abre o modal de edição
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}> 
      {/* Fechar teclado ao tocar fora dos campos, EXCLUINDO o modal */}
      <View style={styles.container}>
        <Text style={styles.header}>LIVRO DE RECEITAS</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ NOVA RECEITA</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="SEARCH"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#D1A699"
        />
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.recipeCard}
              onPress={() => handleEditRecipe(index)} // Edição
              onLongPress={() => handleDeleteRecipe(index)} // Exclusão
            >
              <Text style={styles.recipeTitle}>♥ {item.title}</Text>
              {item.ingredients.map((ingredient, i) => (
                <Text key={i} style={styles.ingredientItem}>
                  • {ingredient}
                </Text>
              ))}
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Modal para adicionar ou editar receita */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}> 
            {/* Fechar teclado quando clicar fora do modal */}
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {editingIndex !== null ? "Editar Receita" : "Adicionar Receita"}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Título da Receita"
                  value={newRecipe.title}
                  onChangeText={(text) => setNewRecipe({ ...newRecipe, title: text })}
                  placeholderTextColor="#D1A699"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ingredientes (separados por vírgula)"
                  value={newRecipe.ingredients}
                  onChangeText={(text) =>
                    setNewRecipe({ ...newRecipe, ingredients: text })
                  }
                  placeholderTextColor="#D1A699"
                  multiline
                />
                <TextInput
                  style={styles.input}
                  placeholder="Tempo (em minutos)"
                  value={newRecipe.time}
                  onChangeText={(text) => setNewRecipe({ ...newRecipe, time: text })}
                  placeholderTextColor="#D1A699"
                  keyboardType="numeric"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleAddRecipe}
                  >
                    <Text style={styles.saveButtonText}>
                      {editingIndex !== null ? "Salvar Alterações" : "Salvar"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDEDE0",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#8E4C30",
    marginTop: 10,
    marginBottom: 20,
  },
  addButton: {
    alignSelf: "flex-end",
    backgroundColor: "#F9A826",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  searchInput: {
    backgroundColor: "#FDE5D5",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
    color: "#8E4C30",
  },
  recipeCard: {
    backgroundColor: "#F9CBB6",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8E4C30",
    marginBottom: 10,
  },
  ingredientItem: {
    color: "#8E4C30",
    fontSize: 14,
    marginLeft: 10,
  },
  timeContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#FFDCA8",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 10,
  },
  timeText: {
    fontWeight: "bold",
    color: "#8E4C30",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FDEDE0",
    padding: 20,
    borderRadius: 15,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8E4C30",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#FDE5D5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    color: "#8E4C30",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#F9A826",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#8E4C30",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
