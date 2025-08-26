import React from 'react';
import LightRays from './Components/LightRays';

const Connected = () => {
	return (
		<div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden text-white">
			<LightRays />
			<div className="relative w-full max-w-md z-10 text-center">
				<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
					<h1 className="text-3xl font-light mb-2">Você se conectou</h1>
					<p className="text-white/70">Login concluído com sucesso.</p>
					<div className="mt-6">
						<button onClick={() => { window.location.hash = '#/'; }} className="px-6 py-3 bg-white text-black rounded-xl hover:bg-white/90 transition">Ir para a página inicial</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Connected;


