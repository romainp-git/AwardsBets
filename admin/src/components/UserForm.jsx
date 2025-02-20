import React, { useState } from "react";
import { createUser } from "../api";

const UserForm = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser(userData);
      alert("Utilisateur créé avec succès !");
      setUserData({ username: "", email: "", password: "" });
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur :", error);
      alert("Erreur lors de la création de l'utilisateur");
    }
  };

  return (
    <div className="user-form">
      <h2>Créer un utilisateur</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Pseudo" value={userData.username} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={userData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Mot de passe" value={userData.password} onChange={handleChange} required />
        <button type="submit">Créer</button>
      </form>
    </div>
  );
};

export default UserForm;