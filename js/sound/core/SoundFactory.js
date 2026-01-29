/**
 * SoundFactory - 작가 ID에 따른 사운드 프로파일 인스턴스 생성
 */

// 작가별 사운드 프로파일 import
import { OrganicSoundProfile } from '../profiles/organic/OrganicSoundProfile.js';
import { GeometricSoundProfile } from '../profiles/geometric/GeometricSoundProfile.js';
import { CyberpunkSoundProfile } from '../profiles/cyberpunk/CyberpunkSoundProfile.js';
import { BloomSoundProfile } from '../profiles/bloom/BloomSoundProfile.js';
import { WaveSoundProfile } from '../profiles/wave/WaveSoundProfile.js';
import { CosmicSoundProfile } from '../profiles/cosmic/CosmicSoundProfile.js';
import { ContourSoundProfile } from '../profiles/contour/ContourSoundProfile.js';
import { FlowSoundProfile } from '../profiles/flow/FlowSoundProfile.js';
import { RefractionSoundProfile } from '../profiles/refraction/RefractionSoundProfile.js';

/**
 * 작가 ID와 사운드 프로파일 클래스 매핑
 */
const PROFILE_MAP = {
  'aura-7': OrganicSoundProfile,
  'kuro-x': GeometricSoundProfile,
  'neon-v': CyberpunkSoundProfile,
  'flora-9': BloomSoundProfile,
  'echo-0': WaveSoundProfile,
  'void-3': CosmicSoundProfile,
  'terra-1': ContourSoundProfile,
  'aqua-5': FlowSoundProfile,
  'prism-2': RefractionSoundProfile
};

/**
 * 작가별 사운드 설정
 */
const SOUND_CONFIGS = {
  'aura-7': {
    baseFrequency: 220,
    waveform: 'sine',
    theme: 'organic',
    effects: ['reverb', 'chorus']
  },
  'kuro-x': {
    baseFrequency: 110,
    waveform: 'square',
    theme: 'geometric',
    effects: ['distortion', 'bitcrusher']
  },
  'neon-v': {
    baseFrequency: 330,
    waveform: 'sawtooth',
    theme: 'cyberpunk',
    effects: ['delay', 'flanger']
  },
  'flora-9': {
    baseFrequency: 440,
    waveform: 'triangle',
    theme: 'bloom',
    effects: ['reverb', 'shimmer']
  },
  'echo-0': {
    baseFrequency: 440,
    waveform: 'sine',
    theme: 'wave',
    effects: ['delay', 'reverb']
  },
  'void-3': {
    baseFrequency: 55,
    waveform: 'sine',
    theme: 'cosmic',
    effects: ['deepReverb', 'noise']
  },
  'terra-1': {
    baseFrequency: 165,
    waveform: 'sawtooth',
    theme: 'contour',
    effects: ['filterSweep', 'reverb']
  },
  'aqua-5': {
    baseFrequency: 220,
    waveform: 'sine',
    theme: 'flow',
    effects: ['chorus', 'phaser']
  },
  'prism-2': {
    baseFrequency: 880,
    waveform: 'triangle',
    theme: 'refraction',
    effects: ['phaser', 'shimmer']
  }
};

export class SoundFactory {
  /**
   * 작가 ID로 사운드 프로파일 인스턴스 생성
   * @param {string} artistId - 작가 ID (예: 'echo-0', 'flora-9')
   * @returns {BaseSoundProfile} 사운드 프로파일 인스턴스
   */
  static create(artistId) {
    const normalizedId = artistId.toLowerCase();
    const ProfileClass = PROFILE_MAP[normalizedId];
    const config = SOUND_CONFIGS[normalizedId];

    if (!ProfileClass) {
      console.warn(`[SoundFactory] Unknown artist ID: ${artistId}, using default WaveSoundProfile`);
      return new WaveSoundProfile('unknown', SOUND_CONFIGS['echo-0']);
    }

    return new ProfileClass(normalizedId, config);
  }

  /**
   * 지원하는 작가 ID 목록 반환
   */
  static getSupportedArtists() {
    return Object.keys(PROFILE_MAP);
  }

  /**
   * 작가별 사운드 설정 반환
   */
  static getConfig(artistId) {
    return SOUND_CONFIGS[artistId.toLowerCase()] || null;
  }
}
