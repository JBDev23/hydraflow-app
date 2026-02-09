import { useState } from "react";
import { Dimensions } from "react-native";
import EditorLayout from "./editors/EditorLayout";
import { NameEditor, SliderEditor, WeightEditor } from "./editors/SimpleEditors";
import GenderEditor from "./editors/GenderEditor"
import ActivityEditor from "./editors/ActivityEditor";
import TimeEditor from "./editors/TimeEditor";
import { useGlobal } from "../context/GlobalContext";

const { height: screenHeight } = Dimensions.get('window');

export default function EditModal({ item = "name", value, handleChange }) {
    const [tempVal, setTempVal] = useState(value);
    const { calculateIdealGoal } = useGlobal()

    const getEditorConfig = () => {
        switch (item) {
            case "name":
                return {
                    height: screenHeight * 0.25,
                    title: "¿Cuál es tu nombre?",
                    component: <NameEditor value={tempVal} onChange={setTempVal} />
                };
            case "age":
                return {
                    height: screenHeight * 0.20,
                    title: "¿Cuál es tu edad?",
                    component: <SliderEditor value={tempVal} onChange={setTempVal} min={12} max={99} step={1} />
                };
            case "weight":
                return {
                    height: screenHeight * 0.20,
                    title: "¿Cuál es tu peso?",
                    component: <WeightEditor value={tempVal} onChange={setTempVal} />
                };
            case "height":
                return {
                    height: screenHeight * 0.20,
                    title: "¿Cuál es tu altura?",
                    component: <SliderEditor value={tempVal} onChange={setTempVal} min={100} max={250} step={1} />
                };
            case "gender":
                return {
                    height: screenHeight * 0.15,
                    title: "Para ajustar tu plan",
                    component: <GenderEditor value={tempVal} onChange={setTempVal} />
                };
            case "activity":
                return {
                    height: screenHeight * 0.15,
                    title: "¿Cuánto te mueves?",
                    component: <ActivityEditor value={tempVal} onChange={setTempVal} />
                };
            case "wakeTime":
                return {
                    height: screenHeight * 0.20,
                    title: "¿A qué hora te levantas?",
                    component: <TimeEditor value={tempVal} onChange={setTempVal} icon="sun" colors={['#FFD700', '#FF8C00']} />
                };
            case "sleepTime":
                return {
                    height: screenHeight * 0.20,
                    title: "¿A qué hora te acuestas?",
                    component: <TimeEditor value={tempVal} onChange={setTempVal} icon="moon" colors={['#79D8FE', '#6989E2']} />
                };
            case "goal":
                return {
                    height: screenHeight * 0.15,
                    title: "Elige tu meta",
                    subtitle: `Recomendado: ${calculateIdealGoal()}ml`,
                    component: <SliderEditor value={tempVal} onChange={setTempVal} min={1000} max={5000} step={50} />
                };
            default:
                return { height: 0, component: null };
        }
    };

    const config = getEditorConfig();

    return (
        <EditorLayout
            hydraHeight={config.height}
            title={config.title}
            subtitle={config.subtitle}
            onSave={() => handleChange(tempVal)}
        >
            {config.component}
        </EditorLayout>
    );
}