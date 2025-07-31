// app/403/page.tsx
export default function ForbiddenPage() {
  return (
    <div className="h-screen flex items-center justify-center flex-col text-center">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">403 - Acesso Negado</h1>
      <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
    </div>
  );
}
