
export default function Home() {
  return (
    <div className="text-gray-800" style={{backgroundColor:"#131516"}}>
      <header className="shadow-md" style={{backgroundColor:"#181A1B"}}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">RequestCenter</h1>
          <nav className="space-x-4">
            <a href="#solicitar" className="text-white hover:text-blue-600 transition">Nova Solicitação</a>
            <a href="#consultar" className="text-white hover:text-blue-600 transition">Consultar</a>
            <a href="#contato" className="text-white hover:text-blue-600 transition">Suporte</a>
          </nav>
        </div>
      </header>

      <main className="py-30">
        <section className="text-center px-6">
          <h2 className="text-4xl font-extrabold mb-4 text-white">Bem-vindo à Request Center</h2>
          <p className="text-lg text-white max-w-xl mx-auto">Aqui você pode registrar, acompanhar e gerenciar todas as suas solicitações com agilidade e transparência.</p>
          <div className="mt-10 flex justify-center space-x-4">
            <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">Login</a>
            <a href="/solicitacoes" className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition font-medium">Consultar</a>
          </div>
        </section>

        <section className="mt-24 max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
          <div className="rounded-2xl p-6 shadow hover:shadow-lg transition" style={{backgroundColor: "#181A1B"}}>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Abertura Rápida</h3>
            <p className="text-white text-sm">Registre novas solicitações com poucos cliques, sem burocracia.</p>
          </div>
          <div className="rounded-2xl p-6 shadow hover:shadow-lg transition" style={{backgroundColor: "#181A1B"}}>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Acompanhamento</h3>
            <p className="text-white text-sm">Visualize o andamento em tempo real com status claros e objetivos.</p>
          </div>
          <div className="rounded-2xl p-6 shadow hover:shadow-lg transition" style={{backgroundColor: "#181A1B"}}>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Transparência</h3>
            <p className="text-white text-sm">Todo o histórico da sua solicitação fica disponível de forma centralizada.</p>
          </div>
        </section>
      </main>

      <footer className="border-t mt-24" style={{backgroundColor: "#181A1B"}}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between text-sm text-gray-500">
          <span>© 2025 Central de Solicitações</span>
          <a id="contato" href="mailto:suporte@empresa.com" className="hover:underline">suporte@empresa.com</a>
        </div>
      </footer>
    </div>
  );
}
