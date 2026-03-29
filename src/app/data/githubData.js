import xarxes from "../assets/img/xarxes_proj.png"
import pipTransaltor from "../assets/img/images.jpeg"
import cartesDelMites from "../assets/img/Je8VV+.png"

export const projects = [
    {
        index: 1,
        image: xarxes,
        title: "Video transmission with RTSP and RTP",
        description: "Real-time video streaming system composed of \n" +
            "RTSP to control the streaming session, and RTP to transmit the actual video frames over the network.",
        tags: ["python", "bash"],
        motive: "Uni-Practice"


    },
    {
        index: 2,
        image: pipTransaltor,
        title: "translator-UAB",
        url: "https://devpost.com/software/translator-uabthehack", 
        description: "The Translator UAB the Hack is a pip library that provides methods to translate your Python code from one language to another, translating comments and variables.",
        tags: ["python"],
        motive: "Hackathon"


    },
    {
        index: 3,
        image: cartesDelMites,
        title: "Cartes del Mite",
        url: "https://nsaadig16.itch.io/cartes-del-mite",
        description: "Project created during the LAN Party Lleida 2025. Role-playing video game with maps set in the Catalan culture and llegens, such as Sant Jordi, the Carnestoltes, the Correfocs, the minairons...",
        tags: ["Godot"],
        motive: "GameJam"


    }



]

