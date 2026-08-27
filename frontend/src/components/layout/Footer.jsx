import React from "react";

export function Footer() {
  return (
    <footer className="bg-white text-gray-600 text-sm py-4 mt-6 shadow-inner">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} PetCare. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
