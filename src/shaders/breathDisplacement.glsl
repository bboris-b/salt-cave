float idleBreath = sin(uTime * 6.283185307 * 0.3) * uIdleBreathAmp;
float n = snoise(vec3(position * 2.05) + vec3(0.0, uTime * 0.11, uTime * 0.07));
float organic = n * uNoiseAmp;
float disp = organic + idleBreath + uAudioDisp;
transformed += normal * disp;
