import { View } from 'react-native';
import { Text } from '@/components/ui';

type Project = {
  project: string;
  hours: number;
  color: string;
};

type ProjectsAllocationListProps = {
  data: Project[];
  totalHours: number;
};

export function ProjectsAllocationList({
  data,
  totalHours,
}: ProjectsAllocationListProps) {
  return (
    <View className="gap-3">
      {data.map((project) => {
        const percent
          = totalHours === 0 ? 0 : (project.hours / totalHours) * 100;

        return (
          <View key={project.project} className="gap-2">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1 flex-row items-center gap-3">
                <View
                  className="size-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <Text className="flex-1 text-sm font-medium">
                  {project.project}
                </Text>
              </View>

              <Text
                variant="caption"
                className="text-muted-foreground"
              >
                {project.hours}
                {' '}
                h
              </Text>

              <Text
                variant="caption"
                className="w-12 text-right font-semibold"
              >
                {percent.toFixed(0)}
                %
              </Text>
            </View>

            <View className="bg-muted h-2 rounded-full">
              <View
                className="h-2 rounded-full"
                style={{
                  width: `${Math.max(percent, 4)}%`,
                  backgroundColor: project.color,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
