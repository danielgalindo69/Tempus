import { prisma } from '../../config/database.js';
import type { UpdateAudioSettingsBody, UpdateTimerThresholdsBody } from './audio.schema.js';

/**
 * Obtiene la configuración de audio del usuario e incluye los umbrales de colores del temporizador
 */
export async function getSettings(userId: string) {
  const audioSettings = await prisma.audioSettings.upsert({
    where: { userId },
    create: { userId },
    update: {}
  });

  const thresholds = await prisma.timerColorThreshold.findMany({
    where: { userId },
    orderBy: { threshold: 'asc' }
  });

  return {
    ...audioSettings,
    thresholds
  };
}

/**
 * Actualiza la configuración de audio del usuario
 */
export async function updateSettings(userId: string, data: UpdateAudioSettingsBody) {
  return prisma.audioSettings.update({
    where: { userId },
    data
  });
}

/**
 * Reemplaza la lista completa de umbrales del temporizador para el usuario
 */
export async function updateTimerThresholds(userId: string, data: UpdateTimerThresholdsBody) {
  return prisma.$transaction(async (tx) => {
    // 1. Eliminar umbrales previos
    await tx.timerColorThreshold.deleteMany({
      where: { userId }
    });

    // 2. Crear los nuevos umbrales secuencialmente con sortOrder
    const creations = data.thresholds.map((item, idx) => {
      return tx.timerColorThreshold.create({
        data: {
          userId,
          threshold: item.threshold,
          colorHex: item.colorHex,
          pulse: item.pulse,
          sortOrder: idx
        }
      });
    });

    await Promise.all(creations);

    // 3. Retornar los nuevos umbrales ordenados
    return tx.timerColorThreshold.findMany({
      where: { userId },
      orderBy: { threshold: 'asc' }
    });
  });
}
