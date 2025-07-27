import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const useUserSolicitudesController = (db, phoneNumber, appId) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db || !phoneNumber || !appId) {
      setLoading(false);
      return;
    }

    console.log('🔍 UserSolicitudes: Conectando para teléfono:', phoneNumber);
    console.log('📂 Ruta de colección:', `artifacts/${appId}/clientSolicitudes`);

    setLoading(true);
    setError(null);

    try {
      // Suscripción a las solicitudes del usuario específico
      const solicitudesRef = collection(db, `artifacts/${appId}/clientSolicitudes`);
      const q = query(
        solicitudesRef,
        where('numeroTelefono', '==', phoneNumber)
        // Removemos orderBy para evitar el error de índice
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('📊 UserSolicitudes encontradas:', snapshot.size, 'documentos para teléfono:', phoneNumber);
          
          const solicitudesData = [];
          snapshot.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() };
            console.log('📄 UserSolicitud:', doc.id, data);
            solicitudesData.push(data);
          });

          // Si no encontramos solicitudes, hacer una consulta de debug
          if (solicitudesData.length === 0) {
            console.log('🔍 No se encontraron solicitudes para teléfono:', phoneNumber);
            console.log('🔍 Haciendo consulta de debug para ver todas las solicitudes...');
            
            // Consulta de debug para ver todas las solicitudes
            const debugQuery = query(solicitudesRef);
            onSnapshot(debugQuery, (debugSnapshot) => {
              console.log('📊 Total solicitudes en la colección:', debugSnapshot.size);
              debugSnapshot.forEach((doc) => {
                const debugData = doc.data();
                console.log('📄 Debug solicitud:', doc.id, {
                  numeroTelefono: debugData.numeroTelefono,
                  clienteNombre: debugData.clienteNombre,
                  nombreProducto: debugData.nombreProducto
                });
              });
            }, { once: true });
          }

          // Ordenar en el cliente por fecha de creación (más reciente primero)
          const sortedSolicitudes = solicitudesData.sort((a, b) => {
            const getTimestamp = (solicitud) => {
              const date = solicitud.fechaCreacion;
              if (!date) return 0;
              return date.toDate ? date.toDate().getTime() : new Date(date).getTime();
            };
            
            return getTimestamp(b) - getTimestamp(a); // Descendente (más reciente primero)
          });

          setSolicitudes(sortedSolicitudes);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('❌ Error en suscripción a solicitudes de usuario:', error);
          setError(error);
          setLoading(false);
        }
      );

      return () => {
        console.log('🔌 Desconectando suscripción a solicitudes de usuario');
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ Error configurando suscripción a solicitudes:', error);
      setError(error);
      setLoading(false);
    }
  }, [db, phoneNumber, appId]);

  return {
    solicitudes,
    loading,
    error
  };
};

export default useUserSolicitudesController;
