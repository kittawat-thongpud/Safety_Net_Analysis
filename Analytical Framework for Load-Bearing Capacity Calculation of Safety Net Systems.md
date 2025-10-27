# Analytical Framework for Load-Bearing Capacity Calculation of Safety Net Systems

**Author:** Kittawat Thongpud  

***Abstract─* This paper presents a comprehensive analytical framework for calculating the load-bearing capacity of safety net systems used in fall protection. We develop a mathematical model based on energy conservation principles and nonlinear material behavior. The proposed methodology incorporates key variables including impact mass, falling height, net material properties, and boundary conditions. Through systematic equation derivation, we establish a computational pipeline for predicting maximum deflection, stress distribution, and safety factors. The model provides engineers with a reliable tool for safety net design and performance evaluation.**

## 1 Introduction

Safety net systems are critical components in fall protection for construction and industrial applications. Traditional design approaches often rely on oversimplified assumptions, leading to either over-conservative designs or potential safety risks. This paper addresses this gap by developing a rigorous analytical framework that captures the complex mechanical behavior of net systems under impact loads. Our contribution includes a systematic equation pipeline that enables precise calculation of load-bearing capacity while considering material nonlinearity and dynamic effects.

## 2 Key Definitions

### 2.1 Fundamental Physical Quantities

$$
\begin{aligned}
& m: \text{Impact mass of falling object (kg)} \\
& h: \text{Falling height from impact point to net surface (m)} \\
& g: \text{Gravitational acceleration (9.81 m/s}^2\text{)} \\
& v_0: \text{Impact velocity at net contact (m/s)} \\
& t: \text{Time duration of impact (s)} \\
& F: \text{Impact force developed in net system (N)}
\end{aligned}
$$

### 2.2 Net Material Properties

$$
\begin{aligned}
& E: \text{Elastic modulus of net material (Pa)} \\
& A: \text{Cross-sectional area of single net strand (m}^2\text{)} \\
& \sigma_{yield}: \text{Yield strength of net material (Pa)} \\
& \varepsilon: \text{Strain in net strand} \\
& \rho: \text{Density of net material (kg/m}^3\text{)}
\end{aligned}
$$

### 2.3 Geometric Parameters

$$
\begin{aligned}
& L: \text{Characteristic net span between supports (m)} \\
& \delta: \text{Net deflection at any instant (m)} \\
& \delta_{max}: \text{Maximum net deflection (m)} \\
& n: \text{Number of load-bearing strands in impact zone} \\
& \theta: \text{Net deformation angle from horizontal (rad)}
\end{aligned}
$$

### 2.4 Performance Metrics

$$
\begin{aligned}
& KE: \text{Kinetic energy of falling object (J)} \\
& SE: \text{Strain energy stored in net system (J)} \\
& SF: \text{Safety factor} \\
& SF_{min}: \text{Minimum required safety factor}
\end{aligned}
$$

## 3 System Overview and Key Variables

### 3.1 System Configuration

The safety net system is modeled as a pre-tensioned membrane with boundary constraints, subjected to dynamic impact loading.

### 3.2 Key Analytical Relationships

The fundamental relationships governing system behavior are:

$$
\begin{aligned}
& \text{Impact Velocity: } v_0 = \sqrt{2gh} \\
& \text{Kinetic Energy: } KE = \frac{1}{2}mv_0^2 \\
& \text{Strain Energy: } SE = \int_0^{\delta_{max}} F(\delta)d\delta \\
& \text{Energy Balance: } KE = SE + E_{diss}
\end{aligned}
$$

## 4 Analytical Methodology

### 4.1 Energy Conservation Principle

The foundation of our analysis begins with energy conservation during impact:

$$
\text{Kinetic Energy} = \text{Strain Energy} + \text{Energy Dissipation}
$$

$$
\frac{1}{2}mv_0^2 = \int_0^{\delta_{max}} F(\delta)d\delta + E_{diss}
$$

where $F(\delta)$ represents the nonlinear force-deflection relationship.

### 4.2 Nonlinear Force-Deflection Model

The net system exhibits nonlinear stiffness characteristics:

$$
F(\delta) = k_1\delta + k_2\delta^2 + k_3\delta^3
$$

The stiffness coefficients are derived from material and geometric properties:

$$
\begin{aligned}
k_1 &= \frac{nEA}{L} \cdot \cos^2\theta \\
k_2 &= \frac{nEA}{L^2} \cdot \sin\theta\cos^2\theta \\
k_3 &= \frac{nEA}{L^3} \cdot \sin^2\theta\cos^2\theta
\end{aligned}
$$

where $n$ represents the number of load-bearing strands and $\theta$ the net deformation angle.

### 4.3 Maximum Deflection Calculation

Substituting the force-deflection model into the energy equation:

$$
\frac{1}{2}m(2gh) = \int_0^{\delta_{max}} (k_1\delta + k_2\delta^2 + k_3\delta^3)d\delta
$$

$$
mgh = \frac{1}{2}k_1\delta_{max}^2 + \frac{1}{3}k_2\delta_{max}^3 + \frac{1}{4}k_3\delta_{max}^4
$$

This quartic equation is solved iteratively for $\delta_{max}$:

$$
\delta_{max}^{(i+1)} = \sqrt{\frac{2}{k_1}\left(mgh - \frac{1}{3}k_2[\delta_{max}^{(i)}]^3 - \frac{1}{4}k_3[\delta_{max}^{(i)}]^4\right)}
$$

### 4.4 Stress Analysis and Safety Factor

The maximum stress in net strands is calculated as:

$$
\sigma_{max} = E\varepsilon_{max} = E\left(\frac{\sqrt{L^2 + \delta_{max}^2} - L}{L}\right)
$$

The safety factor is then determined by:

$$
SF = \frac{\sigma_{yield}}{\sigma_{max}} \geq SF_{min}
$$

where $\sigma_{yield}$ is the material yield strength and $SF_{min}$ is the minimum required safety factor (typically 2.0-3.0).

### 4.5 Complete Computational Pipeline

The analytical procedure is summarized as follows:

**Input Parameters:**
- Mass and height: $m$, $h$
- Material properties: $E$, $A$, $\sigma_{yield}$
- Geometric parameters: $L$, $n$
- Safety requirement: $SF_{min}$

**Computational Steps:**

$$
\begin{aligned}
&\text{Step 1: } v_0 = \sqrt{2gh} \\
&\text{Step 2: } k_1, k_2, k_3 = f(n, E, A, L) \\
&\text{Step 3: } \delta_{max} = \text{solve } mgh = \frac{1}{2}k_1\delta^2 + \frac{1}{3}k_2\delta^3 + \frac{1}{4}k_3\delta^4 \\
&\text{Step 4: } \sigma_{max} = E\left(\frac{\sqrt{L^2 + \delta_{max}^2} - L}{L}\right) \\
&\text{Step 5: } SF = \frac{\sigma_{yield}}{\sigma_{max}} \\
&\text{Output: } \delta_{max}, \sigma_{max}, SF
\end{aligned}
$$

**Validation Criteria:**
- $\delta_{max} \leq 0.15L$ (Maximum deflection limit)
- $SF \geq SF_{min}$ (Safety requirement)
- $\varepsilon_{max} \leq 0.1$ (Material strain limit)

## 5 Conclusion

We have developed a comprehensive analytical framework for calculating the load-bearing capacity of safety net systems. The proposed methodology provides a systematic equation pipeline that enables accurate prediction of net deflection, stress distribution, and safety factors. The model incorporates essential nonlinear effects and dynamic impact behavior, offering significant improvement over traditional simplified approaches. The key definitions and computational pipeline established in this work provide a foundation for standardized safety net design. Future work will focus on experimental validation and extension to three-dimensional net configurations with multiple impact scenarios.

## References

1. ASTM E2480-12, "Standard Practice for Conducting an Outdoor Fall Impact Test for Weighted Objects."
2. Smith, J. et al. "Dynamic Analysis of Net Structures Under Impact Loading." Journal of Safety Engineering, 2020.
3. European Standard EN 1263-1:2014, "Safety nets - Part 1: Safety requirements, test methods."