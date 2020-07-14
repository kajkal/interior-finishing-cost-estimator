import React from 'react';
import { useParams } from 'react-router';


export interface ProjectPageProps {
    // children: React.ReactNode;
}

export function ProjectPage(props: ProjectPageProps): React.ReactElement {
    const { projectSlug } = useParams();
    return (
        <div>
            ProjectPage
            <pre>{JSON.stringify({ projectSlug })}</pre>
        </div>
    );
}
