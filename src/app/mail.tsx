"use client";

export default function Mail() {
    const handleSubmit = async (event) => {
        event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada

        // Obtiene los valores del formulario
        const formData = {
            name: event.target.name.value,
            email: event.target.email.value,
            message: event.target.message.value,
        };

        try {
            // Realiza la solicitud al backend
            const response = await fetch("http://localhost:8000/send-message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
                alert("Message sent successfully!"); // Muestra una alerta de éxito
            } else {
                alert("Failed to send message. Please try again.");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className="p-8 rounded-lg shadow-lg mx-[10%]">
            <div className="text-4xl font-bold text-center sm:text-left text-white mb-8 border-b-amber-100">
                <h2>Contact Me</h2>
            </div>
            <form onSubmit={handleSubmit}>
                {/* Name Input */}
                <div className="mb-6">
                    <label htmlFor="name" className="block text-white text-lg font-medium mb-2">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full px-4 py-2 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your Name"
                        required
                    />
                </div>
                {/* Email Input */}
                <div className="mb-6">
                    <label htmlFor="email" className="block text-white text-lg font-medium mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-4 py-2 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="youremail@example.com"
                        required
                    />
                </div>
                {/* Message Input */}
                <div className="mb-6">
                    <label htmlFor="message" className="block text-white text-lg font-medium mb-2">
                        Message
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        className="w-full px-4 py-2 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Write your message here..."
                        rows="5"
                        required
                    ></textarea>
                </div>
                {/* Submit Button */}
                <div className="text-center">
                    <button
                        type="submit"
                        className="px-6 py-3 bg-gray-300 text-gray-900 text-lg font-semibold rounded-md hover:bg-gray-500 transition duration-200 ease-in-out"
                    >
                        Send Message
                    </button>
                </div>
            </form>
        </div>
    );
}



