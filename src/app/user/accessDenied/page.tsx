const AccessDenied = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-2 text-center">
      <h1 className="text-4xl sm:text-8xl">Acesso negado!</h1>
      <p className="text-xl sm:text-2xl">
        Aguarde a liberação de um administrador
      </p>
    </div>
  );
};

export default AccessDenied;
