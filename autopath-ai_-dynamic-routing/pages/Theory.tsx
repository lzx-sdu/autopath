import React, { useEffect, useRef } from 'react';
import { FileText, Download } from 'lucide-react';

declare global {
  interface Window {
    katex: any;
  }
}

const Theory: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Render KaTeX when component mounts
  useEffect(() => {
    if (window.katex && containerRef.current) {
        const mathElements = containerRef.current.querySelectorAll('.math-tex');
        mathElements.forEach((el) => {
            const tex = el.getAttribute('data-tex');
            if (tex) {
                try {
                    window.katex.render(tex, el as HTMLElement, {
                        throwOnError: false,
                        displayMode: el.classList.contains('display-mode')
                    });
                } catch (error) {
                    console.warn("KaTeX render failed:", error);
                    (el as HTMLElement).innerHTML = `<span class="font-mono text-sm opacity-80">${tex}</span>`;
                }
            }
        });
    }
  }, []);

  const MathTex = ({ tex, display = false }: { tex: string, display?: boolean }) => (
      <span 
        className={`math-tex ${display ? 'display-mode block my-4 text-center overflow-x-auto' : 'mx-1 inline-block align-middle'}`} 
        data-tex={tex}
      />
  );

  return (
    <div ref={containerRef} className="p-8 max-w-5xl mx-auto min-h-screen pb-20 text-slate-200 font-serif leading-relaxed">
      
      {/* Paper Header */}
      <div className="border-b border-slate-700 pb-8 mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-brand-400 mb-4 bg-brand-900/20 px-3 py-1 rounded-full text-xs font-sans font-bold uppercase tracking-widest border border-brand-500/30">
             <FileText size={14} /> Technical Research Paper
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight leading-snug font-sans">
          Research on Dynamic Path Planning for Autonomous Driving Based on Improved DQN-RLPSO and<br/>Soft Constraint Mechanism in Complex Dynamic Environments
        </h1>
        <div className="flex justify-center gap-8 text-sm text-slate-400 font-sans">
            <span>AutoPath AI Research Group</span>
            <span>•</span>
            <span>Revised: October 2023</span>
        </div>
      </div>

      {/* Abstract */}
      <div className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 mb-12 font-sans">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Abstract</h3>
        <p className="text-slate-300 text-sm leading-7 text-justify mb-4">
            The time-variance and uncertainty of urban traffic networks are key bottlenecks constraining the efficiency of L4 autonomous vehicles. Existing static planning algorithms suffer from response lag, while dynamic planning algorithms are prone to "path oscillation," seriously affecting ride comfort and control stability. To address these issues, this paper proposes a hierarchical dynamic path planning framework fusing improved intelligent algorithms with adaptive constraint mechanisms. First, a dynamic weighted graph model based on VANET data is constructed to map traffic states in real-time, with edge weights (impedance) considering multi-dimensional factors such as physical travel time, signal delays, and congestion penalties. Second, an improved A* algorithm considering comfort is designed for global initial path planning, and a DQN-RLPSO hybrid algorithm (Deep Q-Network combined with Reinforcement Learning Particle Swarm Optimization) is proposed to handle multi-objective dynamic decisions during driving—the DQN model outputs discrete action strategies (Stay, Reroute, Wait), while the RLPSO algorithm optimizes path details by fusing Q-value guidance with swarm intelligence search. Finally, a novel soft constraint mechanism based on penalty functions is introduced to achieve a Nash equilibrium between efficiency gains and switching costs, effectively suppressing path oscillation. Experiments on a self-developed 9x9 high-fidelity traffic simulation platform show that the proposed framework reduces average travel time by 28.2%, decreases invalid path switching frequency by over 80%, and achieves a constraint satisfaction rate of 97.3% in extreme congestion scenarios compared to mainstream algorithms. This study provides theoretical support and technical reference for the engineering application of autonomous driving path planning in complex dynamic environments.
        </p>
        <p className="text-xs text-slate-400">
            <strong>Keywords:</strong> Autonomous Driving; Path Planning; Dynamic Traffic Environment; Deep Q-Network (DQN); RLPSO; Soft Constraint Mechanism; VANET
        </p>
      </div>

      {/* Content */}
      <div className="space-y-12">

        {/* 1. Introduction */}
        <section>
            <h2 className="text-2xl font-bold text-white mb-6 font-sans flex items-center gap-3">
                <span className="text-brand-500">1.</span> Introduction
            </h2>
            
            <h3 className="text-xl font-bold text-white mb-3 mt-6">1.1 Background and Significance</h3>
            <p className="text-slate-300 text-justify mb-4">
                With the rapid evolution of Intelligent Transportation Systems (ITS) and breakthroughs in autonomous driving technology, L4 autonomous vehicles are increasingly required to operate reliably in unstructured urban traffic environments. Path planning, as a core decision-making module of autonomous driving systems, needs to generate safe, efficient, and comfortable routes based on real-time traffic information. However, urban traffic networks have inherent time-variant (e.g., peak congestion, temporary road closures) and uncertain (e.g., accidents, random speed fluctuations) characteristics, posing severe challenges to traditional path planning algorithms.
            </p>
            <p className="text-slate-300 text-justify mb-4">
                Traditional static planning algorithms (e.g., Dijkstra, Standard A*) assume constant network weights (e.g., travel time) during planning. Vehicles cannot adjust routes dynamically based on real-time changes after departure, leading to "planning failure" when encountering sudden congestion or accidents. On the other hand, dynamic planning algorithms represented by D* Lite and RRT* can update paths in real-time based on environmental changes but are overly sensitive to local traffic fluctuations, often causing vehicles to switch frequently between paths with similar travel times, known as "path oscillation." This phenomenon not only increases the computational burden on the vehicle control system but also induces abrupt changes in acceleration and steering, seriously affecting ride comfort and even threatening driving safety.
            </p>
            <p className="text-slate-300 text-justify mb-4">
                Furthermore, most existing dynamic path planning algorithms fail to fully consider the trade-off between multiple objectives (efficiency, comfort, stability) and lack flexible constraint handling mechanisms. Rigid hard constraints (e.g., strictly limiting the number of reroutes) may lead to suboptimal decisions in extreme scenarios, while unconstrained dynamic adjustments exacerbate oscillation. Therefore, building a path planning system that combines real-time responsiveness, global optimality, and stability has become a core research hotspot in the field of autonomous driving.
            </p>

            <h3 className="text-xl font-bold text-white mb-3 mt-6">1.3 Research Objectives and Contributions</h3>
            <ul className="list-disc list-outside pl-5 space-y-2 text-slate-300">
                <li>Construct a multi-dimensional dynamic weighted graph model fusing travel time, signal delays, and congestion penalties to accurately characterize the time-variant nature of urban road networks;</li>
                <li>Propose an improved A* algorithm considering comfort, introducing turn penalties and road level coefficients in the cost function to enhance the smoothness and rationality of the initial path;</li>
                <li>Design a DQN-RLPSO hybrid algorithm combining DQN's high-level decision-making capability with RLPSO's refined optimization capability to achieve efficient fusion of "decision-planning";</li>
                <li>Innovatively propose an adaptive soft constraint mechanism based on penalty functions to suppress path oscillation by balancing efficiency gains and switching costs, achieving a multi-objective Nash equilibrium.</li>
            </ul>
        </section>

        {/* 2. Data Processing and Modeling */}
        <section>
            <h2 className="text-2xl font-bold text-white mb-6 font-sans flex items-center gap-3">
                <span className="text-brand-500">2.</span> Data Processing Pipeline and Mathematical Modeling
            </h2>
            <p className="text-slate-300 mb-6">
                To achieve real-time and reliable path planning, this paper establishes a closed-loop data processing flow to transform physical traffic information into digital control instructions. The entire calculation cycle is strictly controlled within 50ms to meet the real-time requirements of L4 autonomous driving.
            </p>

            <div className="bg-slate-800/50 p-4 rounded mb-6 text-center text-xs text-slate-500 italic">
                [Fig 1. Data Processing Pipeline of Path Planning System - Placeholder]
            </div>

            <h3 className="text-xl font-bold text-white mb-3 mt-6">2.1 Perception and Mapping</h3>
            <div className="bg-slate-800 p-6 rounded-lg border-l-4 border-blue-500 shadow-lg mb-6">
                <h4 className="text-lg font-bold text-white mb-2">2.1.2 Dynamic Impedance Calculation</h4>
                <p className="text-sm text-slate-300 mb-4">
                    The road network is abstracted as a directed weighted graph <MathTex tex="G(t) = (V, E, W(t))" />, where <MathTex tex="W(t)" /> is the dynamic impedance matrix. Unlike traditional models considering only travel time, this paper introduces multi-dimensional factors to construct the impedance function:
                </p>
                <div className="bg-slate-900 p-4 rounded border border-slate-700 my-4">
                    <MathTex display tex="w_{ij}(t) = \frac{L_{ij}}{v_{ij}^{\text{real}}(t)} + \alpha \cdot \mathbb{I}(\vec{S}_{\text{light}}=1) + \beta \cdot e^{\lambda \cdot (1 - v_{ij}^{\text{real}}(t)/v_{ij}^{\text{lim}})}" />
                </div>
                <p className="text-xs text-slate-400">
                    In Eq.(1): <MathTex tex="\mathbb{I}(\cdot)" /> is the indicator function, <MathTex tex="\alpha = 30s" /> is the fixed red light delay penalty; congestion penalty coefficients <MathTex tex="\beta = 20, \lambda = 5" /> ensure impedance approaches <MathTex tex="+\infty" /> when <MathTex tex="v_{ij}^{\text{real}}(t) \to 0" />.
                </p>
            </div>

            <h3 className="text-xl font-bold text-white mb-3 mt-6">2.2 Decision and State Assessment</h3>
            <p className="text-slate-300 text-justify mb-4">
                To accurately characterize the driving environment and vehicle state, a state vector <MathTex tex="S_t \in \mathbb{R}^6" /> is constructed (all dimensions Min-Max normalized to [0,1]):
            </p>
            <div className="bg-slate-900 p-4 rounded border border-slate-700 my-4">
                <MathTex display tex="S_t = \left[ \frac{D_{\text{remain}}(t)}{D_{\text{total}}}, \frac{T_{\text{remain}}(t)}{T_{\text{init}}}, \frac{D_{\text{cong}}(t)}{D_{\text{cong,max}}}, \frac{v_{\text{curr}}(t)}{v_{\text{lim}}}, \frac{C(t)}{C_{\text{max}}}, \frac{\Delta \theta_{\text{avg}}}{\pi} \right]" />
            </div>
            
            <h4 className="text-lg font-bold text-white mb-2 mt-4">2.2.2 DQN Network Structure and Decision Logic</h4>
            <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm text-left text-slate-300 border border-slate-700">
                    <thead className="bg-slate-800 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-2 border-b border-slate-700">Layer Type</th>
                            <th className="px-4 py-2 border-b border-slate-700">Neurons</th>
                            <th className="px-4 py-2 border-b border-slate-700">Activation</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-slate-900/50">
                            <td className="px-4 py-2 border-b border-slate-800">Input Layer</td>
                            <td className="px-4 py-2 border-b border-slate-800">6</td>
                            <td className="px-4 py-2 border-b border-slate-800">-</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 border-b border-slate-800">Hidden Layer 1</td>
                            <td className="px-4 py-2 border-b border-slate-800">64</td>
                            <td className="px-4 py-2 border-b border-slate-800">ReLU</td>
                        </tr>
                        <tr className="bg-slate-900/50">
                            <td className="px-4 py-2 border-b border-slate-800">Hidden Layer 2</td>
                            <td className="px-4 py-2 border-b border-slate-800">32</td>
                            <td className="px-4 py-2 border-b border-slate-800">ReLU</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2">Output Layer</td>
                            <td className="px-4 py-2">3</td>
                            <td className="px-4 py-2">Linear</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="text-slate-300 mb-4 text-sm">
                The decision logic is based on the Q-value maximization principle:
                <MathTex tex="a^* = \arg\max_{a \in \{a_0,a_1,a_2\}} Q(S_t, a; \theta)" />, where the action set includes Stay, Reroute, and Wait.
            </p>

            <h4 className="text-lg font-bold text-white mb-2 mt-4">2.2.3 Reward Function Design</h4>
            <div className="bg-slate-900 p-4 rounded border border-slate-700 my-4">
                <MathTex display tex="r_t = \omega_1 \cdot r_{\text{time}} + \omega_2 \cdot r_{\text{stable}} + \omega_3 \cdot r_{\text{comfort}}" />
            </div>
            <p className="text-xs text-slate-400">
                Where <MathTex tex="r_{\text{time}}" /> is the efficiency reward, <MathTex tex="r_{\text{stable}}" /> is the stability penalty (negative when rerouting), and <MathTex tex="r_{\text{comfort}}" /> is the comfort reward.
            </p>

            <h3 className="text-xl font-bold text-white mb-3 mt-6">2.3 Global-Local Collaborative Optimization</h3>
            <div className="bg-slate-800 p-6 rounded-lg border-l-4 border-emerald-500 shadow-lg mb-6">
                <h4 className="text-lg font-bold text-white mb-2">2.3.1 Improved A* Algorithm</h4>
                <p className="text-sm text-slate-300 mb-2">
                    The improved A* algorithm enhances path comfort and rationality by optimizing the cost function. The evaluation function is <MathTex tex="f(n) = g(n) + h(n)" />, where <MathTex tex="g(n)" /> incorporates turn penalties and road level coefficients:
                </p>
                <div className="bg-slate-900 p-4 rounded border border-slate-700 my-4">
                    <MathTex display tex="g(n) = g(\text{parent}(n)) + w_{ij}(t) \cdot \left(1 + K_{\text{turn}} \cdot \Delta \theta_{ij} + K_{\text{level}} \cdot \Gamma_{ij}\right)" />
                </div>
                <p className="text-sm text-slate-300 mb-2">
                     <MathTex tex="h(n)" /> is the dynamically weighted heuristic function:
                </p>
                <div className="bg-slate-900 p-4 rounded border border-slate-700 my-4">
                    <MathTex display tex="h(n) = \gamma \cdot \frac{D_{\text{straight}}(n,B)}{v_{\text{lim,avg}}} + (1-\gamma) \cdot T_{\text{init}}(n,B)" />
                </div>

                <h4 className="text-lg font-bold text-white mb-2 mt-6">2.3.2 Local Path Optimization (RLPSO)</h4>
                <p className="text-sm text-slate-300 mb-2">
                    The RLPSO algorithm fitness function integrates travel time, constraint penalties, and Q-value guidance:
                </p>
                <div className="bg-slate-900 p-4 rounded border border-slate-700 my-4">
                    <MathTex display tex="\text{Fitness}(P) = T_{\text{travel}}(P) + \mu \cdot \text{Penalty}(P) - \nu \cdot Q(S_t, a_1; \theta)" />
                </div>
                <p className="text-sm text-slate-300 mb-2">
                    Particle update rules:
                </p>
                <div className="bg-slate-900 p-4 rounded border border-slate-700 my-4">
                     <MathTex display tex="v_i(t+1) = w \cdot v_i(t) + c_1 r_1 (pbest_i - x_i(t)) + c_2 r_2 (gbest - x_i(t))" />
                     <MathTex display tex="x_i(t+1) = x_i(t) + v_i(t+1)" />
                </div>
            </div>
        </section>

        {/* 3. Soft Constraint Mechanism */}
        <section>
            <h2 className="text-2xl font-bold text-white mb-6 font-sans flex items-center gap-3">
                <span className="text-brand-500">3.</span> Soft Constraint Mechanism for Suppressing Path Oscillation
            </h2>

            <h3 className="text-xl font-bold text-white mb-3 mt-6">3.2 Design of Soft Constraint Mechanism Based on Penalty Function</h3>
            <p className="text-slate-300 text-justify mb-4">
                To balance stability and adaptability, this paper proposes a soft constraint mechanism based on penalty functions, modeling path switching as an economic decision problem: a reroute action is triggered only when the net benefit (efficiency gain minus switching cost) of rerouting exceeds a threshold.
            </p>
            
            <div className="bg-brand-900/20 p-6 rounded-lg border border-brand-500/30">
                <h4 className="font-bold text-brand-400 mb-2 text-sm">3.2.1 Net Benefit Calculation</h4>
                <div className="bg-slate-900 p-4 rounded border border-slate-700 my-4">
                     <MathTex display tex="\Delta J = (T_{\text{old}} - T_{\text{new}}) - \text{Penalty}(C(t))" />
                </div>
                <p className="text-xs text-slate-300">
                    Where <MathTex tex="\text{Penalty}(C(t)) = K_0 + K_1 \cdot C(t) + K_2 \cdot C(t)^2" /> is the dynamic switching penalty, increasing with the number of reroutes.
                </p>

                <h4 className="font-bold text-brand-400 mb-2 text-sm mt-4">3.2.2 Trigger Conditions</h4>
                <div className="bg-slate-900 p-4 rounded border border-slate-700 my-4">
                     <MathTex display tex="\Delta J > \Psi" />
                </div>
                <p className="text-xs text-slate-300">
                    <MathTex tex="\Psi = 90s" /> (minimum net benefit threshold), forming an adaptive filter.
                </p>
            </div>
        </section>

        {/* 4. Simulation Platform */}
        <section>
            <h2 className="text-2xl font-bold text-white mb-6 font-sans flex items-center gap-3">
                <span className="text-brand-500">4.</span> High-Fidelity Simulation Platform Construction
            </h2>
            <p className="text-slate-300 text-justify mb-4">
                To verify the effectiveness and engineering feasibility of the proposed algorithm, a high-fidelity traffic simulation platform (AutoPath AI Simulation Platform) was independently developed based on React + TypeScript + WebGL.
            </p>
            <ul className="list-disc list-outside pl-5 space-y-2 text-slate-300 text-sm">
                <li><strong>Procedural Grid Generator:</strong> The platform abandons hard-coded map data and uses procedural generation methods to build a 9x9 grid road network, automatically generating 81 nodes and 144 directed edges.</li>
                <li><strong>Dynamic Environment Engine:</strong> At the micro level, road speeds follow a Gaussian distribution <MathTex tex="v_{ij}^{\text{real}}(t) \sim N(\mu_{ij}(t), \sigma^2)" />; at the macro level, user-defined accidents and traffic light changes are supported.</li>
                <li><strong>VANET Data Simulation:</strong> Simulates real-time data transmission between vehicles and RSUs, with a communication delay of 10ms and a packet loss rate of 2%.</li>
            </ul>
        </section>

        {/* 5. Experimental Results */}
        <section>
            <h2 className="text-2xl font-bold text-white mb-6 font-sans flex items-center gap-3">
                <span className="text-brand-500">5.</span> Experimental Results and Analysis
            </h2>
            
            <h3 className="text-xl font-bold text-white mb-3 mt-6">5.2.1 Efficiency Evaluation</h3>
            <p className="text-slate-300 mb-4 text-sm">Table 2 shows the average travel time and speed of each algorithm in different scenarios:</p>
            <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm text-left text-slate-300 border border-slate-700">
                    <thead className="bg-slate-800 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-2 border-b border-slate-700">Algorithm</th>
                            <th className="px-4 py-2 border-b border-slate-700">Normal Traffic (Time/Speed)</th>
                            <th className="px-4 py-2 border-b border-slate-700">Peak Congestion (Time/Speed)</th>
                            <th className="px-4 py-2 border-b border-slate-700">Extreme Congestion (Time/Speed)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="px-4 py-2 border-b border-slate-800">A*</td><td className="px-4 py-2 border-b border-slate-800">18.2m / 41.2km/h</td><td className="px-4 py-2 border-b border-slate-800">35.7m / 21.3km/h</td><td className="px-4 py-2 border-b border-slate-800">52.3m / 14.5km/h</td></tr>
                        <tr><td className="px-4 py-2 border-b border-slate-800">D* Lite</td><td className="px-4 py-2 border-b border-slate-800">17.8m / 42.1km/h</td><td className="px-4 py-2 border-b border-slate-800">32.5m / 23.4km/h</td><td className="px-4 py-2 border-b border-slate-800">45.6m / 16.7km/h</td></tr>
                        <tr><td className="px-4 py-2 border-b border-slate-800">Proposed Framework</td><td className="px-4 py-2 border-b border-slate-800 text-brand-400 font-bold">13.1m / 57.3km/h</td><td className="px-4 py-2 border-b border-slate-800 text-brand-400 font-bold">25.6m / 29.7km/h</td><td className="px-4 py-2 border-b border-slate-800 text-brand-400 font-bold">30.1m / 25.2km/h</td></tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-xl font-bold text-white mb-3 mt-6">5.2.3 Comfort and Constraint Evaluation</h3>
            <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm text-left text-slate-300 border border-slate-700">
                    <thead className="bg-slate-800 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-2 border-b border-slate-700">Algorithm</th>
                            <th className="px-4 py-2 border-b border-slate-700">Avg Steering Angle (rad)</th>
                            <th className="px-4 py-2 border-b border-slate-700">Max Acceleration (m/s²)</th>
                            <th className="px-4 py-2 border-b border-slate-700">Constraint Satisfaction Rate (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="px-4 py-2 border-b border-slate-800">A*</td><td className="px-4 py-2 border-b border-slate-800">0.85</td><td className="px-4 py-2 border-b border-slate-800">3.2</td><td className="px-4 py-2 border-b border-slate-800">95.1</td></tr>
                        <tr><td className="px-4 py-2 border-b border-slate-800">D* Lite</td><td className="px-4 py-2 border-b border-slate-800">0.92</td><td className="px-4 py-2 border-b border-slate-800">3.8</td><td className="px-4 py-2 border-b border-slate-800">94.7</td></tr>
                        <tr><td className="px-4 py-2 border-b border-slate-800">Proposed Framework</td><td className="px-4 py-2 border-b border-slate-800 text-brand-400 font-bold">0.51</td><td className="px-4 py-2 border-b border-slate-800 text-brand-400 font-bold">2.3</td><td className="px-4 py-2 border-b border-slate-800 text-brand-400 font-bold">97.3</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        {/* 6. Conclusion */}
        <section className="border-t border-slate-700 pt-8">
            <h2 className="text-2xl font-bold text-white mb-4 font-sans">6. Conclusion and Future Work</h2>
            <p className="text-slate-300 text-justify leading-7 mb-4">
                This paper proposes a complete hierarchical dynamic path planning framework for autonomous path planning in complex urban environments. The results show that:
                <br/>1. The multi-dimensional dynamic weighted graph model accurately characterizes the time-variant nature of the road network.
                <br/>2. The improved A* algorithm considering comfort and the DQN-RLPSO hybrid algorithm achieve efficient dynamic path adjustment.
                <br/>3. The soft constraint mechanism based on penalty functions effectively suppresses path oscillation and achieves multi-objective Nash equilibrium.
            </p>
            <p className="text-slate-300 text-justify leading-7">
                Experiments on the self-developed high-fidelity simulation platform show that the proposed framework outperforms existing algorithms in efficiency, stability, comfort, and constraint compliance, reducing average travel time by 28.2% and decreasing invalid path switching by over 80%. Future work will focus on extending the road network model to complex topological structures and researching multi-vehicle collaborative path planning.
            </p>
        </section>

        {/* References */}
        <section className="pt-8 text-xs text-slate-500 border-t border-slate-800">
            <h3 className="font-bold uppercase tracking-widest mb-4">References (Selected)</h3>
            <ul className="space-y-2 font-mono">
                <li>[1] SAE International. SAE J3016: Taxonomy and Definitions for Terms Related to Driving Automation Systems. 2021.</li>
                <li>[2] Chen, L., et al. Dynamic path planning for autonomous vehicles in urban traffic environments: A review. IEEE T-ITS, 2020.</li>
                <li>[3] Hart, P. E., et al. A formal basis for the heuristic determination of minimum cost paths. IEEE T-SSC, 1968.</li>
                <li>[4] Koenig, S., & Likhachev, M. D* Lite. AAAI, 2002.</li>
                <li>[5] Mnih, V., et al. Human-level control through deep reinforcement learning. Nature, 2015.</li>
                <li>[6] Kennedy, J., & Eberhart, R. C. Particle swarm optimization. IEEE ICNN, 1995.</li>
            </ul>
        </section>

      </div>
    </div>
  );
};

export default Theory;