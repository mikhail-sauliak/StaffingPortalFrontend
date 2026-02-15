import React, { useState, useEffect } from 'react';
import { Tree } from 'primereact/tree';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const OrganizationalChartComponent = ({ people, onUpdateManager }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const buildTree = (managerId, visited = new Set()) => {
            if (visited.has(managerId)) {
                return []; // Прерывание рекурсии, если обнаружен цикл
            }
            visited.add(managerId);

            return people
                .filter(person => person.talentManagerId === managerId && person.id !== managerId)
                .map(person => ({
                    key: person.id,
                    label: `${person.firstName} ${person.lastName}`,
                    isDismissed: person.isDismissed,
                    children: buildTree(person.id, visited)
                }));
        };

        const head = people.find(person => person.divisionManagerId === person.id && person.talentManagerId === person.id);

        if (head) {
            const rootNode = {
                key: head.id,
                label: `${head.firstName} ${head.lastName}`,
                isDismissed: head.isDismissed,
                children: buildTree(head.id)
            };

            setChartData([rootNode]);

            console.log('Generated Tree Structure:', JSON.stringify([rootNode], null, 2));
        }
    }, [people]);

    const moveNode = (draggedNode, targetNode, position) => {
        // Найти человека, который был перетащен
        const draggedPerson = people.find(person => person.id === parseInt(draggedNode.key, 10));

        if (!draggedPerson) return;

        // Обновить TalentManagerId у перетащенного человека
        const updatedPeople = people.map(person => {
            if (person.id === draggedPerson.id) {
                return {
                    ...person,
                    talentManagerId: targetNode ? parseInt(targetNode.key, 10) : null
                };
            }
            return person;
        });

        // Вызов обновления в родительском компоненте
        onUpdateManager(updatedPeople);
    };

    const nodeTemplate = (node) => {
        return (
            <div className="custom-node">
                <div className="node-content">
                    <strong>{node.label}</strong>
                    {node.isDismissed && (
                        <div style={{ color: 'red', fontWeight: 'bold' }}>
                            Dismissed employee
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-d-flex p-jc-center">
            <Tree
                value={chartData}
                nodeTemplate={nodeTemplate}
                dragdropScope="chart"
                draggable
                onDragDrop={(e) => moveNode(e.dragNode, e.dropNode, e.dropPosition)}
            />
        </div>
    );
};

export default OrganizationalChartComponent;
