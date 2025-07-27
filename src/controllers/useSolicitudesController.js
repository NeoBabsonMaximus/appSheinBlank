// useSolicitudesController - Controller para Solicitudes de Clientes (Controller Layer)
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';

const useSolicitudesController = (db, userId, appId) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para agrupar solicitudes por número de teléfono
  const groupSolicitudesByPhone = (solicitudesList) => {
    if (!solicitudesList || solicitudesList.length === 0) return [];

    const grouped = {};
    
    solicitudesList.forEach(solicitud => {
      // Validaciones para evitar errores
      if (!solicitud || !solicitud.numeroTelefono) return;
      
      // Debug: verificar qué campos tenemos
      console.log('🔍 Debug solicitud:', {
        nombreCliente: solicitud.nombreCliente,
        clienteNombre: solicitud.clienteNombre,
        numeroTelefono: solicitud.numeroTelefono
      });
      
      const phone = solicitud.numeroTelefono;
      if (!grouped[phone]) {
        grouped[phone] = {
          numeroTelefono: phone,
          clienteNombre: solicitud.nombreCliente || solicitud.clienteNombre || 'Cliente Desconocido',
          solicitudes: [],
          totalProductos: 0,
          fechaUltima: solicitud.fechaCreacion || new Date()
        };
      }
      
      grouped[phone].solicitudes.push(solicitud);
      
      // Cada solicitud ES un producto individual
      grouped[phone].totalProductos += 1;
      
      // Mantener la fecha más reciente
      const fechaSolicitud = solicitud.fechaCreacion || new Date();
      if (fechaSolicitud > grouped[phone].fechaUltima) {
        grouped[phone].fechaUltima = fechaSolicitud;
        grouped[phone].clienteNombre = solicitud.nombreCliente || solicitud.clienteNombre || grouped[phone].clienteNombre;
      }
    });

    // Convertir a array y ordenar por fecha más reciente
    return Object.values(grouped).sort((a, b) => 
      new Date(b.fechaUltima) - new Date(a.fechaUltima)
    );
  };

  // Suscripción a solicitudes de clientes desde Firebase
  useEffect(() => {
    if (!db || !appId) {
      console.log('⏳ useSolicitudesController: Esperando configuración...');
      return;
    }

    console.log(`📂 useSolicitudesController: Conectando a artifacts/${appId}/clientSolicitudes`);
    setLoading(true);
    setError(null);

    try {
      // RUTA CORREGIDA: artifacts/{appId}/clientSolicitudes
      const solicitudesRef = collection(db, `artifacts/${appId}/clientSolicitudes`);
      
      // Consulta TODAS las solicitudes (sin filtro procesada)
      const q = query(
        solicitudesRef,
        orderBy('fechaCreacion', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log(`📊 Solicitudes encontradas: ${snapshot.size} documentos`);
        
        const solicitudesData = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log(`📄 Solicitud ${doc.id}:`, data);
          
          return {
            id: doc.id,
            ...data,
            fechaCreacion: data.fechaCreacion?.toDate ? data.fechaCreacion.toDate() : new Date(data.fechaCreacion)
          };
        });

        console.log('✅ Solicitudes procesadas para mostrar:', solicitudesData);
        setSolicitudes(solicitudesData);
        setLoading(false);
        
      }, (error) => {
        console.error('❌ Error al suscribirse a solicitudes:', error);
        setError(`Error: ${error.message}`);
        setLoading(false);
        
        // Intentar consulta sin orderBy como fallback
        console.log('🔄 Intentando consulta sin orderBy...');
        try {
          const fallbackQ = query(solicitudesRef);
          
          const fallbackUnsubscribe = onSnapshot(fallbackQ, (snapshot) => {
            console.log(`📊 Fallback - Solicitudes encontradas: ${snapshot.size} documentos`);
            
            const solicitudesData = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                fechaCreacion: data.fechaCreacion?.toDate ? data.fechaCreacion.toDate() : new Date(data.fechaCreacion)
              };
            });

            // Ordenar manualmente por fecha
            solicitudesData.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
            
            console.log('✅ Fallback - Solicitudes procesadas:', solicitudesData);
            setSolicitudes(solicitudesData);
            setError(null);
            setLoading(false);
          });
          
          return fallbackUnsubscribe;
        } catch (fallbackError) {
          console.error('❌ Fallback también falló:', fallbackError);
          setError(`Error persistente: ${fallbackError.message}`);
        }
      });

      return () => {
        console.log('🔌 Desconectando suscripción a solicitudes');
        if (unsubscribe) unsubscribe();
      };
      
    } catch (error) {
      console.error('❌ Error al configurar suscripción:', error);
      setError(`Error de configuración: ${error.message}`);
      setLoading(false);
    }
  }, [db, appId]);

  // Función para marcar solicitud como procesada
  const markSolicitudAsProcessed = async (solicitudId) => {
    if (!solicitudId) return;
    
    try {
      console.log(`🔄 Marcando solicitud ${solicitudId} como procesada...`);
      const solicitudRef = doc(db, `artifacts/${appId}/clientSolicitudes`, solicitudId);
      
      await updateDoc(solicitudRef, {
        procesada: true,
        fechaProcesamiento: new Date()
      });
      
      console.log(`✅ Solicitud ${solicitudId} marcada como procesada`);
    } catch (error) {
      console.error('❌ Error al marcar solicitud como procesada:', error);
      throw error;
    }
  };

  // Función para marcar múltiples solicitudes como procesadas
  const markMultipleSolicitudesAsProcessed = async (solicitudesIds) => {
    if (!solicitudesIds || solicitudesIds.length === 0) return;
    
    try {
      console.log(`🔄 Marcando ${solicitudesIds.length} solicitudes como procesadas...`);
      const promises = solicitudesIds.map(id => markSolicitudAsProcessed(id));
      await Promise.all(promises);
      console.log(`✅ ${solicitudesIds.length} solicitudes marcadas como procesadas`);
    } catch (error) {
      console.error('❌ Error al marcar múltiples solicitudes:', error);
      throw error;
    }
  };

  return {
    // Estados
    solicitudes,
    loading,
    error,
    
    // Funciones
    markSolicitudAsProcessed,
    markMultipleSolicitudesAsProcessed,
    groupSolicitudesByPhone
  };
};

export default useSolicitudesController;
