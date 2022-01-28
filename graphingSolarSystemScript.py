# This is just some useful python script for troubleshooting.
import numpy as np
import matplotlib.pyplot as plt
import random

fig = plt.figure(figsize=(12, 12))
ax = fig.add_subplot(projection='3d')

planetName = [
    'sun',
    'mercury',
    'venus',
    'earth',
    'mars',

    'saturn',
    'jupiter',
    'uranus',
    'nepture'
]
roty = lambda x: np.array([[0,np.cos(x),-np.sin(x)],[0,np.sin(x), np.cos(x)],[1,0,0]])
rotx = lambda x: np.array([[0,np.cos(x),-np.sin(x)],[0,np.sin(x), np.cos(x)],[1,0,0]])
rotz = lambda x: np.array([[np.cos(x),-np.sin(x),0],[np.sin(x), np.cos(x),0],[0,0,1]])

rot = 1.1469728200046554
phi = 0.4503683000066066
theta = 1.4122880114458165
north = -0.4833538758034931
      
def set_axes_equal(ax):

    x_limits = ax.get_xlim3d()
    y_limits = ax.get_ylim3d()
    z_limits = ax.get_zlim3d()

    x_range = abs(x_limits[1] - x_limits[0])
    x_middle = np.mean(x_limits)
    y_range = abs(y_limits[1] - y_limits[0])
    y_middle = np.mean(y_limits)
    z_range = abs(z_limits[1] - z_limits[0])
    z_middle = np.mean(z_limits)

    # The plot bounding box is a sphere in the sense of the infinity
    # norm, hence I call half the max range the plot radius.
    plot_radius = 0.5*max([x_range, y_range, z_range])

    ax.set_xlim3d([x_middle - plot_radius, x_middle + plot_radius])
    ax.set_ylim3d([y_middle - plot_radius, y_middle + plot_radius])
    ax.set_zlim3d([z_middle - plot_radius, z_middle + plot_radius])
    
plt.show()

fig = plt.figure(figsize=(12, 12))
ax = fig.add_subplot(projection='3d')
planets = np.array([np.matmul(rotz(-theta),np.matmul(roty(-phi),np.matmul(rotz(-rot),np.array(plan)))) for plan in planetsOrg])
for i in range(len(planets)-2):
 ax.scatter(planets.T[0][i], planets.T[1][i], planets.T[2][i])
 ax.text(planets.T[0][i],planets.T[1][i],planets.T[2][i],  '%s' % (str(planetsName[i])), size=8, zorder=1,  
    color='r')
set_axes_equal(ax) 

plt.show()

fig = plt.figure(figsize=(12, 12))
ax = fig.add_subplot(projection='3d')
planets = np.array([np.matmul(roty(-phi),np.matmul(rotz(-theta),np.matmul(rotz(-rot),np.array(plan)))) for plan in planetsOrg])
for i in range(len(planets)-2):
 ax.scatter(planets.T[0][i], planets.T[1][i], planets.T[2][i])
 ax.text(planets.T[0][i],planets.T[1][i],planets.T[2][i],  '%s' % (str(planetsName[i])), size=8, zorder=1,  
    color='r')
set_axes_equal(ax) 

fig = plt.figure(figsize=(12, 12))
ax = fig.add_subplot(projection='3d')
planets = np.array([np.matmul(roty(-phi),np.matmul(rotz(-theta),np.matmul(rotz(-rot),np.array(plan)))) for plan in planetsOrg])
for i in range(len(planets)-2):
 ax.scatter(planets.T[0][i], planets.T[1][i], planets.T[2][i])
 ax.text(planets.T[0][i],planets.T[1][i],planets.T[2][i],  '%s' % (str(planetsName[i])), size=8, zorder=1,  
    color='r')
set_axes_equal(ax) 

plt.show()

fig = plt.figure(figsize=(12, 12))
ax = fig.add_subplot(projection='3d')
planets = np.array([[-0.1421941173882653,0.09044682219280303,-0.1019583637804314],[-0.0810177795597393,0.08095904441593904,-0.07079042333548537],[-0.022646776826285,0.04883231815005126,-0.03394632672084574],[-0.000004575687905364637,0.0000016770851173501758,-0.000006982683662393873],[-0.0856816233703982,0.32442660149828056,-0.2815113252970611],[-1.11018555368276,0.10590731694677985,-0.3420866596905499],[-1.7337259100704852,0.8034816382042258,-1.0454789778999263],[-2.49667792110439,-2.6169646695069138,1.5350486663588176],[-6.025327383259445,-0.7140931461364607,-0.8429510822428514]]
)
for i in range(len(planets)-2):
 ax.scatter(planets.T[0][i], planets.T[1][i], planets.T[2][i])
 ax.text(planets.T[0][i],planets.T[1][i],planets.T[2][i],  '%s' % (str(planetsName[i])), size=8, zorder=1,  
    color='r')
set_axes_equal(ax) 

plt.show()

