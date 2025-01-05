import { supabase } from "@/integrations/supabase/client";

export const uploadExerciseImage = async (imageFile: File, oldImageUrl: string | null) => {
  const fileExt = imageFile.name.split('.').pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;

  console.log("Starting image upload process...");
  console.log("File path:", filePath);

  try {
    // Delete old image if it exists
    if (oldImageUrl) {
      const oldImagePath = oldImageUrl.split('/').pop();
      if (oldImagePath) {
        console.log("Deleting old image:", oldImagePath);
        await supabase.storage
          .from('exercise-images')
          .remove([oldImagePath]);
      }
    }

    const { error: uploadError, data } = await supabase.storage
      .from('exercise-images')
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error("Image upload error:", uploadError);
      throw uploadError;
    }

    console.log("Image uploaded successfully:", data);

    const { data: { publicUrl } } = supabase.storage
      .from('exercise-images')
      .getPublicUrl(filePath);

    console.log("Generated public URL:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Error in uploadImage:", error);
    throw error;
  }
};

export const updateExercise = async (exerciseId: string, updateData: any) => {
  console.log("Starting exercise update process...");
  console.log("Exercise ID:", exerciseId);
  console.log("Update data:", updateData);

  try {
    const { data, error } = await supabase
      .from('exercises')
      .update(updateData)
      .eq('id', exerciseId)
      .select(`
        *,
        workout_goals (
          name
        )
      `)
      .single();

    if (error) {
      console.error("Error updating exercise:", error);
      throw error;
    }

    if (!data) {
      console.error("No data returned after update");
      throw new Error("Failed to update exercise");
    }

    console.log("Exercise updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in updateExercise:", error);
    throw error;
  }
};

export const createExercise = async (exerciseData: any) => {
  console.log("Creating new exercise...");
  console.log("Exercise data:", exerciseData);
  
  try {
    const { data, error } = await supabase
      .from('exercises')
      .insert([exerciseData])
      .select(`
        *,
        workout_goals (
          name
        )
      `)
      .single();

    if (error) {
      console.error("Error creating exercise:", error);
      throw error;
    }

    if (!data) {
      console.error("No data returned after creation");
      throw new Error("Failed to create exercise");
    }

    console.log("Exercise created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in createExercise:", error);
    throw error;
  }
};