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
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [receitas, setReceitas] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalVisivel, setModalVisivel] = useState(false);
  const [novaReceita, setNovaReceita] = useState({
    titulo: "",
    ingredientes: "",
    tempo: "",
  });
  const [indiceEdicao, setIndiceEdicao] = useState(null);

  useEffect(() => {
    const carregarReceitas = async () => {
      const receitasArmazenadas = await AsyncStorage.getItem("receitas");
      if (receitasArmazenadas) {
        setReceitas(JSON.parse(receitasArmazenadas));
      }
    };
    carregarReceitas();
  }, []);

  useEffect(() => {
    const salvarReceitas = async () => {
      await AsyncStorage.setItem("receitas", JSON.stringify(receitas));
    };
    salvarReceitas();
  }, [receitas]);

  const salvarNovaReceita = () => {
    if (!novaReceita.titulo || !novaReceita.ingredientes || !novaReceita.tempo) {
      Alert.alert("Erro", "Por favor, preencha todos os campos!");
      return;
    }

    const receita = {
      titulo: novaReceita.titulo,
      ingredientes: novaReceita.ingredientes.split(",").map((item) => item.trim()),
      tempo: `${novaReceita.tempo} MIN`,
    };

    if (indiceEdicao !== null) {
      const receitasAtualizadas = [...receitas];
      receitasAtualizadas[indiceEdicao] = receita;
      setReceitas(receitasAtualizadas);
    } else {
      setReceitas([...receitas, receita]);
    }

    setNovaReceita({ titulo: "", ingredientes: "", tempo: "" });
    setIndiceEdicao(null);
    setModalVisivel(false);
  };

  const deletarReceita = (indice) => {
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
            const receitasAtualizadas = receitas.filter((_, i) => i !== indice);
            setReceitas(receitasAtualizadas);
          },
        },
      ]
    );
  };

  const editarReceita = (indice) => {
    const receitaEditar = receitas[indice];
    setNovaReceita({
      titulo: receitaEditar.titulo,
      ingredientes: receitaEditar.ingredientes.join(", "),
      tempo: receitaEditar.tempo.replace(" MIN", ""),
    });
    setIndiceEdicao(indice);
    setModalVisivel(true);
  };

  const receitasFiltradas = receitas.filter((receita) =>
    receita.titulo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={estilos.container}>
        <Text style={estilos.cabecalho}>LIVRO DE RECEITAS</Text>
        
        <TouchableOpacity
          style={estilos.botaoAdicionar}
          onPress={() => {
            setIndiceEdicao(null);
            setNovaReceita({ titulo: "", ingredientes: "", tempo: "" });
            setModalVisivel(true);
          }}
        >
          <Text style={estilos.textoBotaoAdicionar}>+ NOVA RECEITA</Text>
        </TouchableOpacity>
        
        <TextInput
          style={estilos.campoBusca}
          placeholder="BUSCAR RECEITA"
          value={busca}
          onChangeText={setBusca}
          placeholderTextColor="#D1A699"
        />
        
        <FlatList
          data={receitasFiltradas}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={estilos.cartaoReceita}
              onPress={() => editarReceita(index)}
              onLongPress={() => deletarReceita(index)}
            >
              <Text style={estilos.tituloReceita}>♥ {item.titulo}</Text>
              {item.ingredientes.map((ingrediente, i) => (
                <Text key={i} style={estilos.itemIngrediente}>
                  • {ingrediente}
                </Text>
              ))}
              <View style={estilos.containerTempo}>
                <Text style={estilos.textoTempo}>{item.tempo}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        <Modal visible={modalVisivel} animationType="slide" transparent={true}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={estilos.containerModal}>
              <View style={estilos.conteudoModal}>
                <Text style={estilos.tituloModal}>
                  {indiceEdicao !== null ? "Editar Receita" : "Adicionar Receita"}
                </Text>
                
                <TextInput
                  style={estilos.input}
                  placeholder="Título da Receita"
                  value={novaReceita.titulo}
                  onChangeText={(text) => setNovaReceita({ ...novaReceita, titulo: text })}
                  placeholderTextColor="#D1A699"
                />
                <TextInput
                  style={estilos.input}
                  placeholder="Ingredientes (separados por vírgula)"
                  value={novaReceita.ingredientes}
                  onChangeText={(text) => setNovaReceita({ ...novaReceita, ingredientes: text })}
                  placeholderTextColor="#D1A699"
                  multiline
                />
                <TextInput
                  style={estilos.input}
                  placeholder="Tempo (em minutos)"
                  value={novaReceita.tempo}
                  onChangeText={(text) => setNovaReceita({ ...novaReceita, tempo: text })}
                  placeholderTextColor="#D1A699"
                  keyboardType="numeric"
                />
                
                <View style={estilos.botoesModal}>
                  <TouchableOpacity
                    style={estilos.botaoSalvar}
                    onPress={salvarNovaReceita}
                  >
                    <Text style={estilos.textoBotaoSalvar}>
                      {indiceEdicao !== null ? "Salvar Alterações" : "Salvar"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={estilos.botaoCancelar}
                    onPress={() => setModalVisivel(false)}
                  >
                    <Text style={estilos.textoBotaoCancelar}>Cancelar</Text>
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

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDEDE0",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  cabecalho: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#8E4C30",
    marginTop: 10,
    marginBottom: 20,
  },
  botaoAdicionar: {
    alignSelf: "flex-end",
    backgroundColor: "#F9A826",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  textoBotaoAdicionar: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  campoBusca: {
    backgroundColor: "#FDE5D5",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
    color: "#8E4C30",
  },
  cartaoReceita: {
    backgroundColor: "#F9CBB6",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  tituloReceita: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8E4C30",
    marginBottom: 10,
  },
  itemIngrediente: {
    color: "#8E4C30",
    fontSize: 14,
    marginLeft: 10,
  },
  containerTempo: {
    alignSelf: "flex-end",
    backgroundColor: "#FFDCA8",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 10,
  },
  textoTempo: {
    fontWeight: "bold",
    color: "#8E4C30",
  },
  containerModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  conteudoModal: {
    backgroundColor: "#FDEDE0",
    padding: 20,
    borderRadius: 15,
    width: "80%",
  },
  tituloModal: {
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
  botoesModal: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  botaoSalvar: {
    backgroundColor: "#F9A826",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  textoBotaoSalvar: {
    color: "#FFF",
    fontWeight: "bold",
  },
  botaoCancelar: {
    backgroundColor: "#8E4C30",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  textoBotaoCancelar: {
    color: "#FFF",
    fontWeight: "bold",
  },
});